import pandas as pd

def optimize_schedule(available_buses, pending_routes):
    """
    Simple optimization: Assigns the highest capacity buses to the 
    longest/most demanding routes first.
    """
    assignments = []
    # Sort buses by capacity (Descending)
    available_buses.sort(key=lambda x: x.capacity, reverse=True)
    
    for i, route in enumerate(pending_routes):
        if i < len(available_buses):
            assignments.append({
                "bus": available_buses[i].bus_number,
                "route": route.route_name,
                "status": "Scheduled"
            })
    return assignments
