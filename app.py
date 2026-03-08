from flask import Flask, jsonify, render_template
from models import db, Bus, Route, Schedule
from optimizer import optimize_schedule

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///autoroute.db'
db.init_app(app)

@app.before_first_request
def create_tables():
    db.create_all()
    # Seed initial data if empty
    if not Bus.query.first():
        db.session.add(Bus(bus_number="B101", capacity=50))
        db.session.add(Route(route_name="Downtown Express", stops="A,B,C,D"))
        db.session.commit()

@app.route('/')
def dashboard():
    buses = Bus.query.all()
    routes = Route.query.all()
    return render_template('index.html', buses=buses, routes=routes)

@app.route('/run-optimizer')
def run_opt():
    buses = Bus.query.filter_by(status="Active").all()
    routes = Route.query.all()
    results = optimize_schedule(buses, routes)
    return jsonify(results)

if __name__ == '__main__':
    app.run(debug=True)
