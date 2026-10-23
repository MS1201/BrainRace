import API_BASE from '../config';

export const submitScore = async (playerName, score) => {
    const response = await fetch(`${API_BASE}/api/update-score`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ playerName, score })
    });
    const result = await response.json();

    if (!response.ok) {
        throw new Error(result.error || 'Failed to save score.');
    }

    if (!result?.name) {
        throw new Error('Score was not associated with a user.');
    }

    return result;
};
