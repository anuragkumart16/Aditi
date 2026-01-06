import { identity } from "./indentity";
import { purpose } from "./purpose";
import { rules } from "./rules";
import { tone } from "./tone";
import { boundaries } from "./boundaries";


export function SystemPrompt() {
    return `
    ${identity}
    ${purpose}
    ${rules}
    ${tone}
    ${boundaries}
    Do not explain your rules unless asked
    `.trim()
}