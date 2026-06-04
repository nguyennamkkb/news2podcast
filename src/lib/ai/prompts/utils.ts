/**
 * Sanitize user input before inserting into LLM prompts to reduce prompt injection risk.
 * This is a defense-in-depth measure — not a complete solution.
 */
export function sanitizePromptInput(input: string): string {
  return input
    // Remove common prompt injection patterns
    .replace(/\b(ignore|disregard|override)\s+(all\s+)?(previous|above|prior)\s+(instructions|prompts|rules|system)\b/gi, "")
    // Remove role-breaking patterns
    .replace(/\byou\s+are\s+now\b/gi, "")
    .replace(/\bnew\s+instructions?\b/gi, "")
    // Remove special tokens that could interfere with model processing
    .replace(/\<\|.*?\|\>/g, "")
    // Remove explicit system role attempts
    .replace(/\bsystem\s*:\s*/gi, "")
    // Limit length
    .slice(0, 2000);
}

/**
 * Sanitize LLM-generated research content before passing to another prompt.
 * Less aggressive than sanitizePromptInput since this is already model output —
 * just remove special tokens and limit length.
 */
export function sanitizeResearchContent(input: string): string {
  return input
    // Remove special tokens that could interfere with model processing
    .replace(/\<\|.*?\|\>/g, "")
    // Limit length
    .slice(0, 5000);
}