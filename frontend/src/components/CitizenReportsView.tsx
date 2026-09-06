import React, { useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { tNum, tAuto } from '../i18n';
import { useUIStore } from '../store/uiStore';
import { 
  Camera, MapPin, Upload, AlertTriangle, CheckCircle, Clock, 
  Eye, FileText, Send, Check, ShieldAlert, Sparkles, Filter
} from 'lucide-react';

export const CitizenReportsView: React.FC = () => {
  const { user, citizenReports, addCitizenReport, updateCitizenReport } = useUIStore();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form States
  const [category, setCategory] = useState<string>('Crack in road/slope');
  const [description, setDescription] = useState<string>('');
  const [severity, setSeverity] = useState<'Low' | 'Moderate' | 'Severe'>('Moderate');
  const [district, setDistrict] = useState<string>('East Khasi Hills');
  const [stateName, setStateName] = useState<string>('Meghalaya');
  const [latitude, setLatitude] = useState<number>(25.5788);
  const [longitude, setLongitude] = useState<number>(91.8933);
  const [mediaUrls, setMediaUrls] = useState<string[]>([
    '/images/camera-feeds/shillong-nh6.jpg'
  ]);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submitSuccess, setSubmitSuccess] = useState<boolean>(false);
  const [filterStatus, setFilterStatus] = useState<string>('all');

  // Sample photo choices for prototype sandbox upload simulation (Verified Mountain Highways & Slopes)
  const samplePhotos = [
    '/images/camera-feeds/shillong-nh6.jpg',
    '/images/camera-feeds/haflong-nh27.jpg',
    '/images/camera-feeds/gangtok-nh10.jpg',
    '/images/camera-feeds/tawang-nh13.jpg'
  ];

  // Auto GPS Detection Simulation
  const handleDetectGPS = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setLatitude(parseFloat(pos.coords.latitude.toFixed(4)));
          setLongitude(parseFloat(pos.coords.longitude.toFixed(4)));
        },
        () => {
          // Default NER GPS fallback (East Khasi Hills)
          setLatitude(25.5788);
          setLongitude(91.8933);
        }
      );
    }
  };

  // Handle Image Upload File Select
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const filesArray = Array.from(e.target.files);
      filesArray.forEach((file) => {
        const reader = new FileReader();
        reader.onload = (event) => {
          if (event.target?.result) {
            setMediaUrls((prev) => [event.target!.result as string, ...prev]);
          }
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const handleSelectSamplePhoto = (url: string) => {
    if (!mediaUrls.includes(url)) {
      setMediaUrls((prev) => [...prev, url]);
    }
  };

  // Submit Form Handler
  const handleSubmitReport = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) return;

    setIsSubmitting(true);

    const newReport = {
      id: Date.now(),
      reporter_email: user?.email || 'field_officer@prithvi.gov.in',
      reporter_role: user?.role || 'Citizen Observer',
      category,
      description,
      severity,
      locationName: `${district}, ${stateName}`,
      district,
      state: stateName,
      latitude,
      longitude,
      mediaUrls,
      timestamp: new Date().toISOString(),
      status: 'New',
      ai_classification_tags: {
        crack_detected: category.includes('Crack'),
        slope_movement: category.includes('movement'),
        road_blockage: category.includes('blockage'),
        confidence: 0.92
      }
    };

    setTimeout(() => {
      addCitizenReport(newReport);
      setIsSubmitting(false);
      setSubmitSuccess(true);
      setDescription('');
      setTimeout(() => setSubmitSuccess(false), 4000);
    }, 400);
  };

  // Filtered list
  const filteredReports = filterStatus === 'all' 
    ? citizenReports 
    : citizenReports.filter(r => (r.status || 'New').toLowerCase() === filterStatus.toLowerCase());

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      
      {/* HEADER BANNER */}
      <div className="bg-gradient-to-r from-emerald-950 via-navy-900 to-cyan-950 border border-navy-800 rounded-2xl p-6 shadow-2xl relative overflow-hidden">
        <div className="flex items-center justify-between relative z-10">
          <div>
            <div className="flex items-center space-x-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-accent-green/20 text-accent-green border border-accent-green/30">
                FIELD OFFICER & CITIZEN PORTAL
              </span>
              <span className="text-xs text-slate-400">NER Early Warning System</span>
            </div>
            <h1 className="text-2xl font-black text-white tracking-wide">
              Geo-Tagged Photo & Hazard Reporting
            </h1>
            <p className="text-xs text-slate-300 mt-1 max-w-2xl">
              Upload photos/videos of cracks, soil slope displacement, or road blockages across North Eastern Region highways. Verified severe reports trigger emergency incident tickets automatically.
            </p>
          </div>

          <div className="hidden lg:flex items-center space-x-3 bg-navy-950/80 p-3 rounded-xl border border-navy-800">
            <div className="text-right">
              <div className="text-xs text-slate-400">Active Role</div>
              <div className="text-sm font-bold text-accent-green">{user?.role || 'Citizen'}</div>
            </div>
          </div>
        </div>
      </div>

      {/* TWO COLUMN GRID: SUBMISSION FORM + REPORT GALLERY */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* LEFT COLUMN: SUBMISSION FORM (5 Cols) */}
        <div className="lg:col-span-5 bg-navy-900/70 border border-navy-800 rounded-2xl p-6 shadow-2xl space-y-5">
          <div className="border-b border-navy-800 pb-4">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Upload className="w-5 h-5 text-accent-green" /> {tAuto('Submit Field Observation')}
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">{tAuto('Geo-tagged photo/video upload with location verification.')}</p>
          </div>

          {submitSuccess && (
            <div className="p-4 bg-emerald-500/20 border border-emerald-500 text-emerald-300 rounded-xl text-xs font-bold flex items-center space-x-2 animate-bounce">
              <CheckCircle className="w-5 h-5 text-emerald-400" />
              <span>{tAuto('Report submitted successfully! Added to verification queue.')}</span>
            </div>
          )}

          <form onSubmit={handleSubmitReport} className="space-y-4 text-xs">
            
            {/* Category Dropdown */}
            <div>
              <label className="block font-bold text-slate-300 mb-1.5">{tAuto('Hazard Category')}</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-navy-950 border border-navy-800 rounded-lg p-2.5 text-slate-200 outline-none focus:border-accent-green"
              >
                <option value="Crack in road/slope">⚠️ {tAuto('Crack in road/slope')}</option>
                <option value="Slope/soil movement">🏔️ {tAuto('Slope/soil movement')}</option>
                <option value="Road blockage">🚧 {tAuto('Road blockage')}</option>
                <option value="Other hazard">🌊 {tAuto('Other hazard')}</option>
              </select>
            </div>

            {/* Location & GPS Capture */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-300 mb-1.5">{tAuto('District / Region')}</label>
                <select
                  value={district}
                  onChange={(e) => {
                    setDistrict(e.target.value);
                    if (e.target.value === 'East Khasi Hills') setStateName('Meghalaya');
                    else if (e.target.value === 'Dima Hasao') setStateName('Assam');
                    else if (e.target.value === 'Mangan') setStateName('Sikkim');
                    else if (e.target.value === 'Aizawl') setStateName('Mizoram');
                    else if (e.target.value === 'Noney') setStateName('Manipur');
                    else if (e.target.value === 'Tawang') setStateName('Arunachal Pradesh');
                  }}
                  className="w-full bg-navy-950 border border-navy-800 rounded-lg p-2.5 text-slate-200 outline-none focus:border-accent-green"
                >
                  <option value="East Khasi Hills">East Khasi Hills (Meghalaya)</option>
                  <option value="Dima Hasao">Dima Hasao (Assam)</option>
                  <option value="Mangan">Mangan (Sikkim)</option>
                  <option value="Aizawl">Aizawl (Mizoram)</option>
                  <option value="Noney">Noney (Manipur)</option>
                  <option value="Tawang">Tawang (Arunachal Pradesh)</option>
                  <option value="Kohima">Kohima (Nagaland)</option>
                  <option value="South Tripura">South Tripura (Tripura)</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1.5">{tAuto('GPS Coordinates')}</label>
                <button
                  type="button"
                  onClick={handleDetectGPS}
                  className="w-full bg-navy-850 hover:bg-navy-800 border border-navy-700 text-accent-green font-bold p-2.5 rounded-lg flex items-center justify-center gap-1.5 transition"
                >
                  <MapPin className="w-4 h-4" />
                  <span>{tNum(latitude.toFixed(2))}°N, {tNum(longitude.toFixed(2))}°E</span>
                </button>
              </div>
            </div>

            {/* Severity Radio Selection */}
            <div>
              <label className="block font-bold text-slate-300 mb-1.5">{tAuto('Severity Assessment')}</label>
              <div className="grid grid-cols-3 gap-2">
                {(['Low', 'Moderate', 'Severe'] as const).map((sev) => (
                  <button
                    type="button"
                    key={sev}
                    onClick={() => setSeverity(sev)}
                    className={`py-2 rounded-lg font-bold border transition text-center ${
                      severity === sev 
                        ? sev === 'Severe' ? 'bg-red-500/20 border-red-500 text-red-400' : sev === 'Moderate' ? 'bg-amber-500/20 border-amber-500 text-amber-400' : 'bg-emerald-500/20 border-emerald-500 text-emerald-400'
                        : 'bg-navy-950 border-navy-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {tAuto(sev)}
                  </button>
                ))}
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block font-bold text-slate-300 mb-1.5">{tAuto('Observation Notes')}</label>
              <textarea
                rows={3}
                placeholder="Describe slope condition, crack width, blocked lanes, or weather at site..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full bg-navy-950 border border-navy-800 rounded-lg p-2.5 text-slate-200 placeholder-slate-500 outline-none focus:border-accent-green"
                required
              />
            </div>

            {/* Multi-Photo / Video Upload Box */}
            <div>
              <label className="block font-bold text-slate-300 mb-1.5">{tAuto('Upload Photo / Video Evidence')}</label>
              
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-navy-700 hover:border-accent-green rounded-xl p-4 bg-navy-950/60 text-center transition cursor-pointer relative"
              >
                <input 
                  ref={fileInputRef}
                  type="file" 
                  accept="image/*,video/*" 
                  multiple 
                  onChange={handleFileUpload} 
                  className="hidden" 
                />
                <Camera className="w-8 h-8 text-accent-green mx-auto mb-2" />
                <div className="font-bold text-slate-200">{tAuto('Click to upload photos/videos')}</div>
                <div className="text-[10px] text-slate-400 mt-1">{tAuto('Accepts PNG, JPG, MP4 (Multiple files supported)')}</div>
              </div>

              {/* Sample Quick Selector */}
              <div className="mt-2 flex items-center space-x-2">
                <span className="text-[10px] text-slate-400">{tAuto('Sample Photos:')}</span>
                <div className="flex space-x-1.5">
                  {samplePhotos.map((url, idx) => (
                    <img 
                      key={idx}
                      src={url}
                      alt="Sample"
                      onClick={() => handleSelectSamplePhoto(url)}
                      className="w-8 h-8 object-cover rounded border border-navy-700 hover:border-accent-green cursor-pointer"
                    />
                  ))}
                </div>
              </div>

              {/* Uploaded Thumbnails Preview */}
              {mediaUrls.length > 0 && (
                <div className="mt-3 grid grid-cols-4 gap-2">
                  {mediaUrls.map((url, idx) => (
                    <div key={idx} className="relative aspect-square bg-slate-900 rounded-lg overflow-hidden border border-navy-700 group">
                      <img src={url} alt="Preview" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => setMediaUrls(mediaUrls.filter((_, i) => i !== idx))}
                        className="absolute top-1 right-1 bg-black/70 text-red-400 p-0.5 rounded-full text-[10px] opacity-0 group-hover:opacity-100 transition"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 bg-accent-green hover:bg-accent-green/85 text-navy-950 font-black text-sm rounded-xl shadow-lg transition flex items-center justify-center space-x-2"
            >
              <Send className="w-4 h-4" />
              <span>{isSubmitting ? tAuto('Uploading & Processing AI Tags...') : tAuto('Submit Field Report')}</span>
            </button>
          </form>
        </div>

        {/* RIGHT COLUMN: REPORT GALLERY & MODERATION FEED (7 Cols) */}
        <div className="lg:col-span-7 space-y-4">
          
          <div className="flex items-center justify-between flex-wrap gap-2">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Eye className="w-5 h-5 text-accent-green" /> {tAuto('Submitted Reports Gallery')} ({tNum(citizenReports.length)})
            </h2>

            {/* Filter Tabs */}
            <div className="flex items-center space-x-1.5 bg-navy-900 p-1 rounded-xl border border-navy-800 text-xs font-semibold">
              {['all', 'New', 'Under Review', 'Verified', 'Action Taken'].map((st) => (
                <button
                  key={st}
                  onClick={() => setFilterStatus(st)}
                  className={`px-3 py-1 rounded-lg transition ${
                    filterStatus === st ? 'bg-accent-green text-navy-950 font-bold' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {tAuto(st)}
                </button>
              ))}
            </div>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredReports.map((report) => (
              <div 
                key={report.id}
                className="bg-navy-900/70 border border-navy-800 rounded-xl overflow-hidden shadow-xl flex flex-col justify-between"
              >
                {/* Thumbnail / Header Image */}
                <div className="relative h-40 bg-navy-950 overflow-hidden">
                  <img
                    src={report.mediaUrls && report.mediaUrls.length > 0 ? report.mediaUrls[0] : '/images/camera-feeds/shillong-nh6.jpg'}
                    alt="Field Photo"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-navy-950 via-transparent to-black/50" />

                  <div className="absolute top-2 left-2 flex items-center space-x-1">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      report.severity === 'Severe' ? 'bg-red-500 text-white' : report.severity === 'Moderate' ? 'bg-amber-500 text-navy-950' : 'bg-emerald-500 text-navy-950'
                    }`}>
                      {tAuto(report.severity)} {tAuto('Severity')}
                    </span>
                  </div>

                  <div className="absolute top-2 right-2 px-2 py-0.5 rounded bg-black/60 backdrop-blur-md text-[10px] font-bold text-accent-green border border-accent-green/30">
                    {tAuto(report.status || 'New')}
                  </div>

                  <div className="absolute bottom-2 left-2 right-2 text-white font-bold text-xs truncate">
                    📍 {report.locationName || `${tNum(report.latitude?.toFixed(2))}°N, ${tNum(report.longitude?.toFixed(2))}°E`}
                  </div>
                </div>

                <div className="p-4 space-y-2 flex-1 flex flex-col justify-between">
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-[11px] text-slate-400">
                      <span className="font-bold text-accent-green">{tAuto(report.category)}</span>
                      <span>{new Date(report.timestamp || Date.now()).toLocaleTimeString()}</span>
                    </div>

                    <p className="text-xs text-slate-200 leading-relaxed font-medium">
                      "{tAuto(report.description)}"
                    </p>

                    <div className="text-[10px] text-slate-400">
                      {tAuto('Submitted by:')} <strong className="text-slate-300">{report.reporter_email}</strong> ({tAuto(report.reporter_role || 'Citizen')})
                    </div>

                    {/* AI Screening Tags */}
                    {report.ai_classification_tags && (
                      <div className="pt-2 flex flex-wrap gap-1">
                        {report.ai_classification_tags.crack_detected && <span className="bg-red-500/10 text-red-400 px-1.5 py-0.5 rounded text-[9px] font-bold">{tAuto('Tension Crack Detected')}</span>}
                        {report.ai_classification_tags.slope_movement && <span className="bg-amber-500/10 text-amber-400 px-1.5 py-0.5 rounded text-[9px] font-bold">{tAuto('Soil Creep Tagged')}</span>}
                        {report.ai_classification_tags.road_blockage && <span className="bg-cyan-500/10 text-cyan-400 px-1.5 py-0.5 rounded text-[9px] font-bold">{tAuto('Lane Blockage Tagged')}</span>}
                      </div>
                    )}
                  </div>

                  {/* Status Workflow Action Bar (Gated to Admin Roles: District Administrator & SDMA Super Admin) */}
                  {(user?.role === 'SDMA Super Admin' || user?.role === 'District Administrator' || user?.role === 'District Admin') && (
                    <div className="pt-3 border-t border-navy-800 flex items-center justify-between gap-1 text-[10px]">
                      <span className="text-slate-500 font-semibold">{tAuto('Workflow:')}</span>
                      <div className="flex space-x-1">
                        <button
                          onClick={() => updateCitizenReport(report.id, 'Under Review')}
                          className={`px-2 py-1 rounded font-bold transition ${
                            report.status === 'Under Review' ? 'bg-amber-500 text-navy-950' : 'bg-navy-800 text-slate-300 hover:text-white'
                          }`}
                        >
                          {tAuto('Review')}
                        </button>

                        <button
                          onClick={() => updateCitizenReport(report.id, 'Verified')}
                          className={`px-2 py-1 rounded font-bold transition ${
                            report.status === 'Verified' ? 'bg-emerald-500 text-navy-950' : 'bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500 hover:text-navy-950'
                          }`}
                        >
                          {tAuto('Verify & Escalate')}
                        </button>

                        <button
                          onClick={() => updateCitizenReport(report.id, 'Action Taken')}
                          className={`px-2 py-1 rounded font-bold transition ${
                            report.status === 'Action Taken' ? 'bg-cyan-500 text-navy-950' : 'bg-navy-800 text-slate-300 hover:text-white'
                          }`}
                        >
                          {tAuto('Action Taken')}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

        </div>

      </div>

    </div>
  );
};
