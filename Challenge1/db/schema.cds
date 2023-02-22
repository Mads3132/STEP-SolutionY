using { cuid, sap, managed, temporal} from '@sap/cds/common';

namespace schema;

entity Project : cuid, managed{
    projectName: String not null;
    startDate: Date not null;
    endDate: Date not null;
    maxHours: Double not null;
    registeredHours: Double;
    
}

entity User : cuid {
    workSchedule: Association to many WorkSchedule on workSchedule.user = $self;    //underscore for association
    username: String(12);
    firstName: String(24);
    lastName: String(24);
    //Image : LargeBinary @Core.MediaType : 'image/png';
    title: String;
}

type WorkDay : Integer64 enum {
    SUNDAY = 0;
    MONDAY = 1;
    TUESDAY = 2;
    WEDNESDAY = 3;
    THURSDAY = 4;
    FRIDAY = 5;
    SATURDAY = 6; 
}

entity DaySchedule : cuid, managed{
    workSchedule: Association to many WorkSchedule;
    startTime: Time;
    endTime: Time; 
    weekDay: WorkDay;
}

entity WorkSchedule : cuid{
    absence: Association to many Absence on absence.workSchedule = $self;
    user: Association to User; // Backlink
    effectiveStartDate: Date; //@cds.valid.from;
    effectiveEndDate: Date; //@cds.valid.to;
}

entity Absence : cuid{
    workSchedule: Association to WorkSchedule;
    absenceStartTime: DateTime;
    absenceEndTime: DateTime;
}

entity WorkHours : cuid,managed{
    project: Association to Project;
    user: Association to User; // Backlink
    //Day: Date;
    startTime: DateTime;
    endTime: DateTime;
}