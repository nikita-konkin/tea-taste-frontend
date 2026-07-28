import React from 'react';

// The monthly transcription allowance, drawn the same way in the admin console
// and on a user's own profile — one component so the two never disagree about
// what "spent" looks like.
function QuotaBar({ used, limit }) {
	const share = limit > 0 ? Math.min(1, used / limit) : 0;
	const spent = share >= 1;

	return (
		<div style={{
			height: '6px', borderRadius: '999px', marginTop: '4px',
			background: 'rgba(255, 255, 255, 0.15)', overflow: 'hidden',
		}}>
			<div style={{
				width: `${Math.round(share * 100)}%`, height: '100%',
				background: spent ? '#ffb27a' : '#a8f493',
			}} />
		</div>
	);
}

export default QuotaBar;
