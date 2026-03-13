import React, { useState } from 'react';

function CopyButton({ text, style }) {
    const [copied, setCopied] = useState(false);

    const handleCopy = async () => {
        try {
            if (navigator.clipboard && navigator.clipboard.writeText) {
                await navigator.clipboard.writeText(text);
            } else {
                // Fallback for non-secure contexts (HTTP) or older browsers
                const textArea = document.createElement("textarea");
                textArea.value = text;
                textArea.style.position = "fixed";
                textArea.style.left = "-9999px";
                textArea.style.top = "0";
                document.body.appendChild(textArea);
                textArea.focus();
                textArea.select();
                document.execCommand('copy');
                document.body.removeChild(textArea);
            }
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy:', err);
        }
    };

    return (
        <button
            onClick={handleCopy}
            className="btn"
            style={{
                fontSize: '0.8rem',
                padding: '0.4rem 0.8rem',
                background: copied ? 'var(--success)' : 'rgba(255,255,255,0.1)',
                border: '1px solid var(--glass-border)',
                ...style
            }}
            title="Copy to clipboard"
        >
            {copied ? '✓ Copied!' : '📋 Copy'}
        </button>
    );
}

export default CopyButton;
