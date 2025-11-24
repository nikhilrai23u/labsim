import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import ExperimentCard from "../shared/ExperimentCard";

export default function Experiments() {
  const [experiments, setExperiments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [q, setQ] = useState("");
  const [subject, setSubject] = useState("all");
  const { isAuthed, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthed) return;
    const fetchExperiments = async () => {
      try {
        setLoading(true);
        setError("");
        let res = await api.get("/experiments");
        if (Array.isArray(res.data) && res.data.length === 0) {
          // try to seed once if empty
          await api.get("/experiments/seed");
          res = await api.get("/experiments");
        }
        setExperiments(res.data || []);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to fetch experiments");
      }
      finally { setLoading(false); }
    };
    fetchExperiments();
  }, [isAuthed]);

  if (!isAuthed) return <p>Please login to view experiments.</p>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-sky-100 to-blue-100 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-baseline justify-between mb-6">
          <h2 className="text-2xl font-bold text-blue-800">Experiments</h2>
          <div className="text-sm text-gray-700">Hello{user?.name ? `, ${user.name}` : ''} 👋</div>
        </div>
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-36 animate-pulse bg-white rounded-xl shadow-sm p-4">
                <div className="h-5 w-40 bg-slate-200 rounded mb-2"></div>
                <div className="h-4 w-24 bg-slate-200 rounded mb-4"></div>
                <div className="h-3 w-full bg-slate-200 rounded mb-2"></div>
                <div className="h-3 w-5/6 bg-slate-200 rounded"></div>
              </div>
            ))}
          </div>
        ) : experiments.length === 0 ? (
          <div className="bg-white rounded-xl p-6 shadow">
            <div className="text-gray-700 mb-3">No experiments found.</div>
            {error && <div className="text-red-500 text-sm mb-3">{error}</div>}
            <button
              className="px-4 py-2 bg-blue-600 text-white rounded"
              onClick={async () => {
                try {
                  setLoading(true);
                  await api.get("/experiments/seed");
                  const res = await api.get("/experiments");
                  setExperiments(res.data || []);
                } finally { setLoading(false); }
              }}
            >
              Load sample experiments
            </button>
          </div>
        ) : (
          <>
            <div className="mb-4 flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
              <input
                value={q}
                onChange={(e)=>setQ(e.target.value)}
                placeholder="Search experiments..."
                className="flex-1 bg-white shadow-sm rounded-lg px-3 py-2 border"
              />
              <select
                className="bg-white shadow-sm rounded-lg px-3 py-2 border w-full sm:w-56"
                value={subject}
                onChange={(e)=>setSubject(e.target.value)}
              >
                <option value="all">All subjects</option>
                <option value="Physics">Physics</option>
              </select>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {experiments
                .filter(e => subject === 'all' || e.subject === subject)
                .filter(e => !q || (e.title+" "+(e.description||"")).toLowerCase().includes(q.toLowerCase()))
                .map((exp) => (
                  <ExperimentCard
                    key={exp._id}
                    exp={exp}
                    onOpen={() => {
                      const slugFromTitle = (exp.title || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
                      const slug = (exp.simulationId && exp.simulationId.toLowerCase() !== 'placeholder') ? exp.simulationId.toLowerCase() : slugFromTitle || exp._id;
                      navigate(`/experiments/${slug}`);
                    }}
                  />
                ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
