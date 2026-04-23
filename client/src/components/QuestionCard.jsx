import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const QuestionCard = ({ question, onAnswer }) => {
    const [selected, setSelected] = useState(null);

    const handleSelect = (option) => {
        if (selected) return;
        setSelected(option);
        setTimeout(() => {
            onAnswer(option);
            setSelected(null);
        }, 400);
    };

    const optionLabels = ['A', 'B', 'C', 'D'];

    return (
        <AnimatePresence mode="wait">
            <motion.div
                key={question.text}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -30 }}
                transition={{ duration: 0.25 }}
                className="bg-white rounded-[32px] p-8 shadow-sm ring-1 ring-black/5"
            >
                <p className="text-xl font-extrabold text-gray-900 mb-8 leading-relaxed">{question.text}</p>
                <div className="grid grid-cols-2 gap-4">
                    {question.options.map((option, i) => {
                        let btnClass = "text-left px-5 py-4 rounded-2xl font-bold text-gray-800 border-2 transition-all ";
                        if (selected === option) {
                            btnClass += option === question.correct
                                ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                                : "border-red-400 bg-red-50 text-red-700";
                        } else {
                            btnClass += "border-gray-100 bg-gray-50 hover:border-violet-400 hover:bg-violet-50 hover:text-violet-700";
                        }
                        return (
                            <motion.button
                                key={option}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.97 }}
                                onClick={() => handleSelect(option)}
                                className={btnClass}
                            >
                                <span className="text-xs font-black text-gray-400 mr-2">{optionLabels[i]}.</span>
                                {option}
                            </motion.button>
                        );
                    })}
                </div>
            </motion.div>
        </AnimatePresence>
    );
};

export default QuestionCard;
