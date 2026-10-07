from flask import Blueprint, jsonify, request
from sqlalchemy import select
from sqlalchemy.orm import Session

from models import Availability, Request
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


@api.route("/requests", methods=["POST"])
def create_request():

    data = request.get_json()

    if not data:
        return jsonify({
            "error": "Request data is required."
        }), 400

    availability_id = data.get("availability_id")
    customer_name = data.get("customer_name")
    customer_email = data.get("customer_email")
    customer_phone = data.get("customer_phone")
    notes = data.get("notes")

    if not availability_id:
        return jsonify({
            "error": "Availability is required."
        }), 400

    if not customer_name or not customer_email:
        return jsonify({
            "error": "Name and email are required."
        }), 400

    with Session(engine) as session:

        # Make sure the selected availability actually exists
        statement = select(Availability).where(
            Availability.id == availability_id,
            Availability.active.is_(True)
        )

        availability = session.scalar(statement)

        if not availability:
            return jsonify({
                "error": "That date is no longer available."
            }), 400

        new_request = Request(
            service_id=availability.service_id,
            availability_id=availability.id,
            customer_name=customer_name.strip(),
            customer_email=customer_email.strip(),
            customer_phone=(
                customer_phone.strip()
                if customer_phone
                else None
            ),
            requested_date=availability.available_date,
            requested_time=availability.start_time,
            notes=notes.strip() if notes else None,
            status="pending"
        )

        session.add(new_request)
        session.commit()
        session.refresh(new_request)

        return jsonify({
            "message": "Request submitted successfully.",
            "request_id": new_request.id
        }), 201