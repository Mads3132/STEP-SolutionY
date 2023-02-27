using { schema } from '../db/schema';

service solutionService {
    entity ProjectSet @(restrict : [ 
        {
            grant : [ 'READ' ],
            to : [ 'User' ]
        },
        {
            grant : [ '*' ],
            to : [ 'Admin' ]
        }
    ]) as projection on schema.Project;

    entity UserSet as projection on schema.User;

    entity WorkScheduleSet as projection on schema.WorkSchedule;

    entity WorkHourSet as projection on schema.WorkHours;

    entity DayScheduleSet as projection on schema.DaySchedule;

    entity AbsenceSet as projection on schema.Absence;

    entity AbstractRegisterHours as projection on schema.AbstractRegisterHours;
    
}

