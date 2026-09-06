import numpy as np

class SusceptibilityModel:
    """
    Static Landslide Susceptibility Model calibrated for the North Eastern Region of India.
    Integrates terrain characteristics, soil, geological factors, and human interference factors.
    """
    def __init__(self):
        # Coefficients/weights representing hazard contributions based on NRSC Landslide Atlas of India
        self.weights = {
            "slope": 0.35,          # Slope angle (steeper slope = major hazard factor)
            "lithology": 0.20,      # Rock/soil stability class
            "soil_type": 0.15,      # Soil composition (e.g., clay percentage, saturation capacity)
            "road_proximity": 0.15, # Cut slopes near roads/highways
            "drainage_dist": 0.15   # Flow channels eroding toe of slopes
        }

    def predict(self, slope_angle: float, elevation: float, soil_type: str, lithology: str, 
                dist_to_road: float, dist_to_drainage: float) -> float:
        """
        Calculates susceptibility index between 0.0 and 100.0.
        """
        # 1. Slope Angle risk (nonlinear: steep angles >30° have exponential risk increase)
        if slope_angle <= 0:
            slope_score = 0.0
        elif slope_angle < 15:
            slope_score = (slope_angle / 15.0) * 30.0  # low risk
        elif slope_angle < 35:
            slope_score = 30.0 + ((slope_angle - 15.0) / 20.0) * 50.0  # moderate-to-high risk
        else:
            # Extreme slopes (>35°)
            slope_score = min(80.0 + ((slope_angle - 35.0) / 20.0) * 20.0, 100.0)

        # 2. Lithology stability factor
        # Values mapped from low (stable granite/gneiss) to high susceptibility (weak shales/sandstones of Dihing/Dupitila formations)
        lithology_map = {
            "granite": 10.0,
            "gneiss": 20.0,
            "quartzite": 15.0,
            "schist": 50.0,
            "sandstone": 70.0,
            "shale": 90.0,
            "unconsolidated_alluvium": 85.0
        }
        lithology_score = lithology_map.get(lithology.lower(), 45.0)

        # 3. Soil moisture retention / type factor
        # Clay/silt retain water and liquefy easily
        soil_map = {
            "sandy_loam": 20.0,
            "silt_loam": 50.0,
            "clay_loam": 75.0,
            "heavy_clay": 95.0,
            "gravelly_soil": 30.0
        }
        soil_score = soil_map.get(soil_type.lower(), 40.0)

        # 4. Proximity to road cut (undercutting of slopes)
        if dist_to_road <= 0:
            road_score = 100.0
        elif dist_to_road < 50:
            road_score = 90.0
        elif dist_to_road < 150:
            road_score = 60.0
        elif dist_to_road < 500:
            road_score = 30.0
        else:
            road_score = 5.0

        # 5. Drainage proximity (toe erosion / water accumulation)
        if dist_to_drainage <= 0:
            drainage_score = 100.0
        elif dist_to_drainage < 30:
            drainage_score = 85.0
        elif dist_to_drainage < 100:
            drainage_score = 60.0
        elif dist_to_drainage < 300:
            drainage_score = 30.0
        else:
            drainage_score = 10.0

        # Weighted combination
        susceptibility = (
            (slope_score * self.weights["slope"]) +
            (lithology_score * self.weights["lithology"]) +
            (soil_score * self.weights["soil_type"]) +
            (road_score * self.weights["road_proximity"]) +
            (drainage_score * self.weights["drainage_dist"])
        )

        return float(np.clip(susceptibility, 0.0, 100.0))

susceptibility_model = SusceptibilityModel()
