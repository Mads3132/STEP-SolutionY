const cds = require('@sap/cds');

module.exports = async function(srv) {
    const {WorkHourSet, ProjectSet, UserSet, WorkScheduleSet, DayScheduleSet, AbsenceSet, AbstractRegisterHours} = srv.entities;

    //Slight user restrictions in the form of no spaces in username and no numbers in first name or last name.
    srv.before('CREATE', 'UserSet', async (req) => {
        const username = req.data.username;
        if (username.includes(" ")){
            req.reject(400, 'Cannot include space');
        }
        const firstName = req.data.firstName;
        if (firstName.includes("1","2","3","4","5","6","7","8","9","0")){
            req.reject(400, 'First name cannot include numbers');
        }
        const lastName = req.data.lastName;
        if (lastName.includes("1","2","3","4","5","6","7","8","9","0")){
            req.reject(400, 'Last name cannot include numbers');
        }
    })
    //------------------Checking validity period-----------------------
    /* Logic for only allowing registering of hours within validity period of project. 
    Project data is requested through a custom filter which finds the correct project through its respective ID. 
    Lastly the handler compares the StartTime and EndTime of the registered WorkHours together with the 
    StartDate and EndDate of the Project. */
    srv.before('CREATE', 'AbstractRegisterHours', async (req)=>{
        const db = srv.transaction(req);
        const currentProject = await db.get(ProjectSet).byKey({ID: req.data.project_ID});
        
        //const filter = await db.get(ProjectSet).where({"ID": req.data["project_ID"]});
        //const currentProjectEntity = filter[0];

        const startTime = new Date(req.data.workHourStartTime);
        const endTime = new Date (req.data.workHourEndTime);

        // Corrects TimezoneOffset
        startTime.setMinutes(startTime.getMinutes()+startTime.getTimezoneOffset());
        endTime.setMinutes(endTime.getMinutes()+endTime.getTimezoneOffset());

        const projectStartDate = new Date(currentProject.startDate);
        const projectEndDate = new Date(currentProject.endDate);
        if (startTime.getTime() < projectStartDate.getTime() || endTime.getTime() > projectEndDate.getTime() ) {
            req.reject(400, "Cannot register hours outside valid project hours");
        }
    
        
    //-----------------Has 11 hours been passed?
    /* Logic for checking if there have been a minimum of 11 hours since last time registration for the same user.
    The handler compares if the newly registered WorkHours 'createdAt time' is >= the previous logged hours - 11, 
    while also taking the user_ID into consideration. */
        const prevEndTime = await db.get(AbstractRegisterHours).where(`user_ID = '${req.data.user_ID}'`);
                            // await db.get(ProjectSet).byKey({ID: req.data.project_ID});
        if (prevEndTime[0] !== null) {
            for(const reg of prevEndTime){
                const uEndTime = new Date(reg.workHourEndTime);
                const uStartTime = new Date(reg.workHourStartTime);
                uEndTime.setHours(uEndTime.getHours() + 11);
                uStartTime.setHours(uStartTime.getHours() - 11);
                if (startTime.getTime() < uEndTime.getTime() && endTime.getTime() > uStartTime.getTime()) {
                    req.reject(400, 'It has been less than 11 hours since last reported work hours');
                    // To make error message more meaningful, make if statements here to figure out which way the 11 hours overlap.
                }
            }
        }
        
        //-------------------- Absence validation --------------------
         /* Here the user can set their absence, but only inside viable working hours. */
        if (req.data.absenceStartTime !== undefined || req.data.absenceStartTime !== null) {
            /*The user sets a "StartDate" and "EndDate" for when he is going to be absent. We take that date, and
            make a new variable out of them to also get the time for when tey are going to be absent. Finally we 
            also make a variable for the current day that date is, and convert it to a string*/
            const absenceStartDate = new Date(req.data.absenceStartTime);
            const absenceEndDate = new Date(req.data.absenceEndTime);
            const absenceStartTime = absenceStartDate.getTime();
            const absenceEndTime = absenceEndDate.getTime();
            const day = absenceStartDate.getDay().toString();

            /* The user inputs a workschedule_ID which belongs to that user. Then we return all those days, where
            that workschedule_ID holds true for that user and create an array out of all those daySchedule entities*/
            const workSchedules = await cds.run(SELECT.from(WorkScheduleSet).where((`user_ID = '${req.data.user_ID}'`)))
            const daySchedules = await cds.run(SELECT.from(DayScheduleSet).where((`workSchedule_ID = '${workSchedules[0].ID}'`)))
            
            /* Loop through each daySchedule entity and find the day which corresponds with the day, the user has 
            inputted*/
            let daySchedule; 
                for(const el of daySchedules) {
                    if(el.weekDay !== day)
                    continue; 
                daySchedule = el;
                }
                /*StartTime and EndTime from daySchedule are 08:00:00, but they should be in Epoch time
                therefore we have to convert them to that, since StartTime and EndTime from Absence is in 
                Epoch time */
                const fromTime = daySchedule.startTime.split(':');
                const toTime = daySchedule.endTime.split(':');
                const workHourStartTime = new Date(absenceStartDate);
                const workHourEndTime = new Date(absenceEndDate);
                workHourStartTime.setHours(parseInt(fromTime[0]),parseInt(fromTime[1]),parseInt(fromTime[2]));
                workHourEndTime.setHours(parseInt(toTime[0]),parseInt(toTime[1]),parseInt(toTime[2]));

            /* if the StartTime and EndTime are NOT within the expected working hours for that day, return an error*/
            
            if (!(absenceStartTime >= workHourStartTime.getTime() && absenceStartTime < absenceEndTime && absenceEndTime <= workHourEndTime.getTime())){
                //console.log(StartTime, EndTime,workHourStartTime.getTime() , workHourEndTime.getTime());    
                req.reject(400, "Cannot register outside workhours");
            }

        }
            //---------------------------Has reached maximum hours?
    /* Logic for insuring that WorkHours cannot be registered if the maximum number of hours for a project have been
    reached. Handler gets the appropiate project key, as well as StartTime and EndTime in hour format from WorkHours. 
    A new projects RegisteredHours should always start at 0.0 and then the calculatedHours can be added to that.
    */
    
        //const project = await db.get(ProjectSet).byKey({ID: req.data.project_ID});

        const startHours = startTime.getHours();
        const endHours = endTime.getHours();

        //The 'const calculatedHours' calculates the amount of hours registered.
        const calculatedHours = endHours-startHours;
        if(!currentProject.registeredHours) currentProject.registeredHours = 0.0; 

        /*If "calculatedHours + RegisteredHours" is less than the maximum hours for a project
        it should reject the request.*/
        if(calculatedHours + currentProject.registeredHours > currentProject.maxHours) {
            req.reject(400, "Maximum hours for this project has already been reached");
            // Potentially add hours left in error message
            return;
        }
        
        //Lastly the projects RegisteredHours is updated in the database.
        currentProject.registeredHours += calculatedHours;
        await db.update(ProjectSet).byKey({ID: currentProject.ID}).with(currentProject);
         
    })  

    
    // Creates new hardcoded DaySchedulesSets every time we create a new WorkScheduleSet.
    // It needs to be modified to take user input upon creating a new WorkScheduleSet,
    // and reuse already made DayScheduleSets that fit the work days within the work week.
    // Possible button for or otherwise option for creating a new DayScheduleSet.
    // // Custom logic to create an entity for each day in the workSchedule
    // srv.on('CREATE', 'WorkScheduleSet', async (req) =>{
    //     const db = srv.transaction(req);
        
    //     const effectiveStartDate = new Date(req.effectiveStartDate);
    //     const effectiveEndDate = new Date(req.effectiveEndDate);
    //     let dates = [];
    //     let validDays = [];
    //     let currentDate = effectiveStartDate;

    //     // Make an array for all the dates the user has put as input and call it "dates".
    //     while(currentDate <= effectiveEndDate){
    //         dates.push(new Date(currentDate));

    //         currentDate.setDate(currentDate.getDate()+1);
    //     }
    //     // loop through the "dates" array, and convert each date into a day, push those days into a new array called "validDays".
    //     for (let i = 0; i < dates.length; i++){
    //         let date = dates[i];
    //         let day = date.getDay();
    //         validDays.push(day);
    //     }

    //     /* "validDays" is an array of ints where each day represents and integer, sunday = 0 monday = 1, etc
    //     loop through that array, and set the respective "StartTime" and "EndTime" for those days and create
    //     an entity out of each day. Give them all the same ID, to distinguish which DaySchedule belongs to which user. */
    //     for (let i = 0; i <validDays.length; i++){
    //         switch(validDays[i]){
    //             case 0:
    //                 await cds.run(INSERT.into(DayScheduleSet).entries([
    //                     {
    //                         workSchedule_ID: req.ID,
    //                         startTime: '00:00:00',
    //                         endTime: '00:00:00',
    //                         weekDay : 0
    //                     }
    //                 ]));
    //                 continue;
    //             case 1:
    //                 await cds.run(INSERT.into(DayScheduleSet).entries([
    //                     {             
    //                         workSchedule_ID: req.ID,              
    //                         startTime: '08:00:00',
    //                         endTime: '16:00:00',
    //                         weekDay : 1
    //                     }
    //                 ]));
    //                 continue;
    //             case 2:
    //                 await cds.run(INSERT.into(DayScheduleSet).entries([
    //                     {           
    //                         workSchedule_ID: req.ID,                
    //                         startTime: '08:00:00',
    //                         endTime: '16:00:00',
    //                         weekDay : 2
    //                     }
    //                 ]));
    //                 continue;
    //             case 3:
    //                 await cds.run(INSERT.into(DayScheduleSet).entries([
    //                     {        
    //                         workSchedule_ID: req.ID,                    
    //                         startTime: '08:00:00',
    //                         endTime: '16:00:00',
    //                         weekDay : 3
    //                     }
    //                 ]));
    //                 continue;
    //             case 4:
    //                 await cds.run(INSERT.into(DayScheduleSet).entries([
    //                     {        
    //                         workSchedule_ID: req.ID,                    
    //                         startTime: '08:00:00',
    //                         endTime: '16:00:00',
    //                         weekDay : 4
    //                     }
    //                 ]));
    //                 continue;
    //             case 5:
    //                 await cds.run(INSERT.into(DayScheduleSet).entries([
    //                     {     
    //                         workSchedule_ID: req.ID,                       
    //                         startTime: '08:00:00',
    //                         endTime: '14:00:00',
    //                         weekDay : 5
    //                     }
    //                 ]));
    //                 continue;
    //             case 6:
    //                 await cds.run(INSERT.into(DayScheduleSet).entries([
    //                     {     
    //                         workSchedule_ID: req.ID,                       
    //                         startTime: '00:00:00',
    //                         endTime: '00:00:00',
    //                         weekDay : 6
    //                     }
    //                 ]));
    //                 continue;
    //             default:
    //                 await cds.run(INSERT.into(DayScheduleSet).entries([
    //                     {
    //                         workSchedule_ID: req.ID,
    //                         startTime: '00:00:00',
    //                         endTime: '00:00:00',
    //                         weekDay : 0
    //                     }
    //                 ]));
    //                 continue;
    //         }
    //     }
    // })

}
