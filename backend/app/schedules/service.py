from datetime import datetime, time

from sqlalchemy.orm import Session

from app.schedules.model import Schedule, ScheduleDay
from app.schedules.schema import (
    ScheduleCreate,
    ScheduleUpdate,
    ScheduleDayCreate,
)


VALID_DAYS = {
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
}


def calculate_daily_hours(
    start_time: time,
    end_time: time,
    break_minutes: int
) -> float:
    start = datetime.combine(
        datetime.today(),
        start_time
    )

    end = datetime.combine(
        datetime.today(),
        end_time
    )

    if end <= start:
        raise ValueError(
            "End time must be after start time"
        )

    total_seconds = (
        end - start
    ).total_seconds()

    total_hours = total_seconds / 3600

    break_hours = break_minutes / 60

    worked_hours = total_hours - break_hours

    if worked_hours < 0:
        raise ValueError(
            "Break time cannot exceed working hours"
        )

    return worked_hours


def calculate_weekly_hours(days) -> float:
    total_hours = 0.0

    for day in days:
        total_hours += calculate_daily_hours(
            day.start_time,
            day.end_time,
            day.break_minutes
        )

    return round(total_hours, 2)


def validate_schedule_days(days):
    if not days:
        raise ValueError(
            "At least one schedule day is required"
        )

    seen_days = set()

    for day in days:
        if day.day_of_week not in VALID_DAYS:
            raise ValueError(
                f"Invalid day of week: {day.day_of_week}"
            )

        if day.day_of_week in seen_days:
            raise ValueError(
                f"Duplicate schedule day: {day.day_of_week}"
            )

        seen_days.add(day.day_of_week)

        calculate_daily_hours(
            day.start_time,
            day.end_time,
            day.break_minutes
        )


def create_schedule(
    db: Session,
    schedule_data: ScheduleCreate
):
    existing_schedule = (
        db.query(Schedule)
        .filter(
            Schedule.name == schedule_data.name
        )
        .first()
    )

    if existing_schedule:
        raise ValueError(
            "Schedule already exists"
        )

    validate_schedule_days(
        schedule_data.days
    )

    weekly_hours = calculate_weekly_hours(
        schedule_data.days
    )

    schedule = Schedule(
        name=schedule_data.name,
        schedule_type=schedule_data.schedule_type,
        weekly_hours=weekly_hours,
    )

    db.add(schedule)
    db.flush()

    for day_data in schedule_data.days:
        schedule_day = ScheduleDay(
            schedule_id=schedule.id,
            day_of_week=day_data.day_of_week,
            start_time=day_data.start_time,
            end_time=day_data.end_time,
            break_minutes=day_data.break_minutes,
        )

        db.add(schedule_day)

    db.commit()
    db.refresh(schedule)

    return schedule


def get_schedules(db: Session):
    return (
        db.query(Schedule)
        .order_by(Schedule.id)
        .all()
    )


def get_schedule(
    db: Session,
    schedule_id: int
):
    return (
        db.query(Schedule)
        .filter(
            Schedule.id == schedule_id
        )
        .first()
    )


def update_schedule(
    db: Session,
    schedule: Schedule,
    schedule_data: ScheduleUpdate
):
    update_data = schedule_data.model_dump(
        exclude_unset=True
    )

    if "name" in update_data:
        existing_schedule = (
            db.query(Schedule)
            .filter(
                Schedule.name == update_data["name"],
                Schedule.id != schedule.id
            )
            .first()
        )

        if existing_schedule:
            raise ValueError(
                "Schedule already exists"
            )

    if "days" in update_data:
        days_data = update_data["days"]

        days = [
            ScheduleDayCreate(**day)
            for day in days_data
        ]

        validate_schedule_days(days)

        schedule.weekly_hours = (
            calculate_weekly_hours(days)
        )

        db.query(ScheduleDay).filter(
            ScheduleDay.schedule_id == schedule.id
        ).delete()

        for day_data in days:
            schedule_day = ScheduleDay(
                schedule_id=schedule.id,
                day_of_week=day_data.day_of_week,
                start_time=day_data.start_time,
                end_time=day_data.end_time,
                break_minutes=day_data.break_minutes,
            )

            db.add(schedule_day)

        update_data.pop("days")

    for field, value in update_data.items():
        setattr(schedule, field, value)

    db.commit()
    db.refresh(schedule)

    return schedule


def delete_schedule(
    db: Session,
    schedule: Schedule
):
    schedule.is_active = False

    db.commit()
    db.refresh(schedule)

    return schedule