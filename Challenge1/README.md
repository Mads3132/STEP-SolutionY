User:
- Image
	- Should work, but haven't tested if it works through PostMan.
- Title
	- Require 'Admin' apporval?
	- No restrictions(Special characters, numbers or spaces etc.) put in place at the moment. 
 
Work Schedule:
- Does not support WorkSchedule that span more than one week.
 

Work Hours:
- RegisteredHours
	- Goes into negative if work hours are reported with the time 00:00:00.
	- RegisterHours still goes up even when a WorkHour request is denied due to the 11 hour rule. This can be fixed by combining the handlers
	  and making sure that the 11 hour rule is checked before RegisterdHours is updated.
- Cannot register work hours if not logged in as Admin.
	- Might be due to the fact that the handler controlling the maximum hours restriction have acess to a lot of information in the Project?


Absence:
- Cannot register absence that span multiple days.
- When registering absense, if the WorkSchedule includes multiple of the same day, it will register absense for all duplicate days.


General Issues / Needed features:
- Add more comments to code.
- Add more 'Not null's in the Schema if needed.
- Reporting overtime. Need to have something compare registered WorkHours with the assumed work time from WorkSchedule for the respective user_ID.
- Inconsistent naming scheme in regards to rules of camelCase and such.
- Some handlers could maybe be combined, especially looking at the different handlers for the WorkHoursSet.
- 11 hour rule may interfer with registering WorkHours in the case of Absence. A Solution could be making a boolean Absence on WokrHours, which 
if true ignores the 11 hour logic on that registration.