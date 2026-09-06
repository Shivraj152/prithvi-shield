class DynamicTriggerModel:
    """
    Dynamic Trigger Model representing antecedent rainfall and soil moisture thresholds.
    Calibrated against standard I-D (Intensity-Duration) curves for the Himalayas & East Hills.
    """
    def __init__(self):
        # Critical rainfall thresholds (in mm) for Northeast India
        self.thresholds = {
            "rain_24h": 80.0,    # Trigger index for rapid shallow landslides / mudflows
            "rain_72h": 160.0,   # Intermediate accumulation saturation
            "rain_7d": 300.0     # Deep-seated failure triggering threshold
        }

    def predict(self, rain_24h: float, rain_72h: float, rain_7d: float, soil_moisture: float) -> float:
        """
        Computes dynamic hazard triggering probability (0.0 to 100.0).
        """
        # Cumulative rainfall trigger risk calculation
        score_24h = min((rain_24h / self.thresholds["rain_24h"]) * 100.0, 100.0)
        score_72h = min((rain_72h / self.thresholds["rain_72h"]) * 100.0, 100.0)
        score_7d = min((rain_7d / self.thresholds["rain_7d"]) * 100.0, 100.0)

        # Soil moisture saturation factor: below 30% moisture, landslide triggering is highly unlikely.
        # Above 70%, liquid limit is approached, and triggering probability goes up.
        if soil_moisture < 30.0:
            moisture_factor = 0.2
        elif soil_moisture < 70.0:
            moisture_factor = 0.2 + ((soil_moisture - 30.0) / 40.0) * 0.6  # ranges 0.2 to 0.8
        else:
            moisture_factor = 0.8 + ((soil_moisture - 70.0) / 30.0) * 0.2  # ranges 0.8 to 1.0

        # Weighted combination of rain durations:
        # Shallow failures are highly sensitive to 24h intensity, deep failures to 7d.
        rain_trigger_base = (score_24h * 0.5) + (score_72h * 0.3) + (score_7d * 0.2)

        # Multiply by soil moisture saturation proxy
        trigger_probability = rain_trigger_base * moisture_factor

        return float(max(0.0, min(trigger_probability, 100.0)))

dynamic_trigger_model = DynamicTriggerModel()
