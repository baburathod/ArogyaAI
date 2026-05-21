"use client";
import { motion, AnimatePresence } from 'framer-motion';

export function MobileNav({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', stiffness: 300 }}
          className="fixed inset-y-0 right-0 w-80 bg-white p-4 z-50 border-l border-[rgba(15,38,23,0.04)]"
        >
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold">Menu</h3>
            <button onClick={onClose} aria-label="Close menu">✕</button>
          </div>
          <nav className="flex flex-col gap-3">
            <a href="/dashboard" className="nav-link">Dashboard</a>
            <a href="/body-map" className="nav-link">Body Map</a>
            <a href="/emergency" className="nav-link">SOS</a>
            <a href="/ai" className="nav-link">AI Assistant</a>
            <a href="/voice" className="nav-link">Voice Assistant</a>
            <a href="#" className="nav-link">Records</a>
            <a href="#" className="nav-link">Hospitals</a>
            <a href="#" className="nav-link">Doctor</a>
          </nav>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
