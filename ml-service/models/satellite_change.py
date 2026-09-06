class SatelliteChangeDetector:
    """
    Simulates CNN/U-Net change detection on Sentinel-1 SAR coherence and Sentinel-2 NDVI optical tiles.
    """
    def predict(self, current_ndvi: float, historical_ndvi: float, sar_coherence: float) -> dict:
        """
        Flags landslide scarps or ground deformation.
        Returns:
            dict containing:
                change_detected (bool): Whether a significant ground deformation is flagged
                confidence (float): Confidence score (0.0 to 100.0)
                anomaly_type (str): 'Devegetation', 'Displacement', 'Vegetated Landslide' or 'None'
        """
        ndvi_drop = historical_ndvi - current_ndvi
        
        # 1. Vegetation loss detection (NDVI drop)
        devegetation_flag = ndvi_drop > 0.15
        
        # 2. Slope creep/displacement detection (SAR coherence decrease)
        # Coherence ranges from 0.0 (fully decorrelated/moving) to 1.0 (perfectly stable)
        displacement_flag = sar_coherence < 0.4
        
        confidence = 0.0
        anomaly_type = "None"
        change_detected = False
        
        if devegetation_flag and displacement_flag:
            # High confidence landslide scarp
            change_detected = True
            confidence = min(50.0 + (ndvi_drop * 100.0) + ((0.4 - sar_coherence) * 100.0), 98.0)
            anomaly_type = "Active Landslide Scarp"
        elif devegetation_flag:
            # Could be logging, forest fire, or landslide
            change_detected = ndvi_drop > 0.25
            confidence = min(30.0 + (ndvi_drop * 100.0), 80.0)
            anomaly_type = "Vegetation Loss"
        elif displacement_flag:
            # Sub-canopy movement (detected by SAR, no optical change)
            change_detected = sar_coherence < 0.25
            confidence = min(30.0 + ((0.4 - sar_coherence) * 150.0), 85.0)
            anomaly_type = "Sub-Canopy Slope Creep"

        return {
            "change_detected": change_detected,
            "confidence": float(round(confidence, 2)),
            "anomaly_type": anomaly_type,
            "ndvi_drop": float(round(ndvi_drop, 3))
        }

satellite_change_detector = SatelliteChangeDetector()
