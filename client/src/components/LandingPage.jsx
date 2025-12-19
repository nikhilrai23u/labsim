import React from "react";
import { BeakerIcon, RocketIcon, AtomIcon } from "lucide-react"; // lucide-react for nice icons
import { motion } from "framer-motion";

const LandingPage = ({ onGetStarted }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-sky-100 to-indigo-200 text-gray-800 flex flex-col">
      {/* Navbar */}
      <nav className="flex items-center justify-between px-10 py-6 bg-white/40 backdrop-blur-md shadow-md sticky top-0 z-50">
        <h1 className="text-3xl font-extrabold text-blue-700">LabSim</h1>
        <button
          onClick={onGetStarted}
          className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-md transition"
        >
          Get Started Here
        </button>
      </nav>

      {/* Hero Section */}
      <motion.section
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
        className="flex flex-col items-center justify-center text-center px-6 mt-24"
      >
        <h2 className="text-5xl font-extrabold text-blue-800 leading-tight mb-4">
          Experience Science. Virtually.
        </h2>
        <p className="text-lg text-gray-700 max-w-2xl">
          LabSim is a <b>Virtual Science Experiment Simulation Platform</b> where
          students can safely perform experiments, visualize reactions, and learn
          through interactive simulations — anytime, anywhere.
        </p>

        <div className="mt-10 flex gap-6">
          <button
            onClick={onGetStarted}
            className="px-6 py-3 bg-blue-600 text-white rounded-xl shadow hover:bg-blue-700 transition"
          >
            Explore Simulations
          </button>
          <button className="px-6 py-3 border-2 border-blue-600 text-blue-700 rounded-xl hover:bg-blue-50 transition">
            Learn More
          </button>
        </div>
      </motion.section>

      {/* Features Section */}
      <section className="grid md:grid-cols-3 gap-8 px-12 py-20">
        {[
          {
            icon: <BeakerIcon className="w-10 h-10 text-blue-600" />,
            title: "Safe Experimentation",
            desc: "Perform virtual experiments without real-world hazards or costly lab setups.",
          },
          {
            icon: <AtomIcon className="w-10 h-10 text-blue-600" />,
            title: "Interactive Learning",
            desc: "Visualize chemical reactions, physics experiments, and biological processes in real-time.",
          },
          {
            icon: <RocketIcon className="w-10 h-10 text-blue-600" />,
            title: "Progress Tracking",
            desc: "Save sessions, revisit results, and track your scientific growth.",
          },
        ].map((f, i) => (
          <motion.div
            key={i}
            whileHover={{ scale: 1.05 }}
            className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition text-center"
          >
            <div className="flex justify-center mb-4">{f.icon}</div>
            <h3 className="text-xl font-semibold mb-2 text-blue-700">{f.title}</h3>
            <p className="text-gray-600">{f.desc}</p>
          </motion.div>
        ))}
      </section>

      {/* Footer */}
      <footer className="text-center py-6 bg-white/60 mt-auto">
        <p className="text-gray-600 text-sm">
          © {new Date().getFullYear()} LabSim. All rights reserved.
        </p>
      </footer>
    </div>
  );
};

export default LandingPage;
