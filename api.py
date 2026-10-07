from flask import Blueprint, jsonify
from sqlalchemy import select
from sqlalchemy.orm import Session

from models import Availability
from database import engine


api = Blueprint("api", __name__, url_prefix="/api")


@api.route("/availability")
def get_availability():
    with Session(engine) as session:
        statement = select(Availability).where(
            Availability.active == True
        )

        availability = session.scalars(statement).all()

        results = [
            {
                "id": item.id,
                "date": item.available_date.isoformat(),
                "service_id": item.service_id,
                "start_time": (
                    item.start_time.isoformat()
                    if item.start_time else None
                ),
                "end_time": (
                    item.end_time.isoformat()
                    if item.end_time else None
                )
            }
            for item in availability
        ]

        return jsonify(results)