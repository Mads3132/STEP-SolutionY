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
    username: String(32) not null;
    firstName: String(32) not null;
    lastName: String(32) not null;
    //Image : LargeBinary @Core.MediaType : 'image/png';
    title: String not null;
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
    startTime: Time not null;
    endTime: Time not null; 
    weekDay: WorkDay not null;
}

entity WorkSchedule : cuid{
    user: Association to User not null; // Backlink
    startDate: Date not null; //@cds.valid.from;
    endDate: Date not null; //@cds.valid.to;
}

entity Absence : cuid{
    user: Association to User not null;
    project: Association to Project;
    startTime: DateTime not null;
    endTime: DateTime not null;
}

entity WorkHours : cuid,managed{
    project: Association to Project not null;
    user: Association to User not null; // Backlink
    startTime: DateTime not null;
    endTime: DateTime not null;
}

entity AbstractRegisterHours : cuid {
    project: Association to Project not null;
    user: Association to User not null; // Backlink
    workHourStartTime: DateTime not null;
    workHourEndTime: DateTime not null;
    absenceStartTime: DateTime;
    absenceEndTime: DateTime;
}