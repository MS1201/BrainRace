import React from 'react';
import { motion } from 'framer-motion';

const ProgressBar = ({ redScore, blueScore }) => {
    const total = 100;
    const redPct = Math.min(redScore, total);
    const bluePct = Math.min(blueScore, total);

    return (
        <div className="w-full bg-white rounded-[24px] p-6 shadow-sm ring-1 ring-black/5">
            <div className="flex justify-between items-center mb-4">
                <span className="text-sm font-bold text-red-500 uppercase tracking-wider">You</span>
                <span className="text-xs font-bold text-gray-400">First to 100 wins!</span>
                <span className="text-sm font-bold text-blue-500 uppercase tracking-wider">Opponent</span>
            </div>
            {/* Red bar */}
            <div className="mb-3">
                <div className="flex justify-between mb-1">
                    <span className="text-xs font-bold text-gray-500">🔴 {redScore}%</span>
                </div>
                <div className="w-full h-4 bg-red-100 rounded-full overflow-hidden">
                    <motion.div
                        className="h-full bg-gradient-to-r from-red-400 to-red-500 rounded-full"
                        animate={{ width: `${redPct}%` }}
                        transition={{ type: 'spring', stiffness: 60 }}
                    />
                </div>
            </div>
            {/* Blue bar */}
            <div>
                <div className="flex justify-between mb-1">
                    <span className="text-xs font-bold text-gray-500">🔵 {blueScore}%</span>
                </div>
                <div className="w-full h-4 bg-blue-100 rounded-full overflow-hidden">
                    <motion.div
                        className="h-full bg-gradient-to-r from-blue-400 to-blue-500 rounded-full"
                        animate={{ width: `${bluePct}%` }}
                        transition={{ type: 'spring', stiffness: 60 }}
                    />
                </div>
            </div>
        </div>
    );
};

export default ProgressBar;
