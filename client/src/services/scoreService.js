import { useCallback, useRef } from 'react';
import API_BASE from '../config';

export const submitScore = async (user, score, game = 'General') => {
    const numericScore = Math.round(Number(score)) || 0;
    const response = await fetch(`${API_BASE}/api/update-score`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            userId: user?._id,
            email: user?.email,
            playerName: user?.name,
            score: numericScore,
            game
        })
    });
    const result = await response.json();

    if (!response.ok) {
        throw new Error(result.error || 'Failed to save score.');
    }

    return result;
};

export const useScoreSubmission = (user, defaultGame = 'General') => {
    const sessionRef = useRef({ saved: false, pending: null });

    const saveScore = useCallback((score, game = defaultGame) => {
        const numericScore = Math.round(Number(score)) || 0;
        if (numericScore <= 0) return Promise.resolve(true);

        const session = sessionRef.current;
        if (session.saved) return Promise.resolve(true);
        if (session.pending) return session.pending;

        const pending = submitScore(user, numericScore, game)
            .then(() => {
                session.saved = true;
                return true;
            })
            .catch(error => {
                console.error('Failed to save score:', error);
                return false;
            })
            .finally(() => {
                session.pending = null;
            });

        session.pending = pending;
        return pending;
    }, [user?._id, user?.email, user?.name, defaultGame]);

    const resetScoreSubmission = useCallback(() => {
        sessionRef.current = { saved: false, pending: null };
    }, []);

    return { saveScore, resetScoreSubmission };
};

export const saveScoreAndExit = async (saveScore, score, onBack, game = 'General') => {
    const numericScore = Math.round(Number(score)) || 0;
    if (numericScore > 0) {
        try {
            await saveScore(numericScore, game);
        } catch (e) {
            console.warn('Score could not be saved before exit:', e);
        }
    }
    onBack?.();
};
