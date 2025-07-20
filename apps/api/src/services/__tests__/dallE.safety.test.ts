// Test file for DALL-E safety filter
import { describe, test, expect } from '@jest/globals';
import { sanitizeDallEPrompt } from '../dallE.service';

describe('DALL-E Safety Filter', () => {
    test('should handle the grizzly bear fighting scenario', () => {
        const violentPrompt = "Dark and intense, high-quality, photorealistic, fighting a grizzly bear, man in combat with dangerous bear, forest setting, evoke survival struggle";
        const safePrompt = sanitizeDallEPrompt(violentPrompt);
        
        expect(safePrompt).toContain('powerful majestic bear in natural habitat');
        expect(safePrompt).toContain('overcoming challenges');
        expect(safePrompt).toContain('symbolic representation');
        expect(safePrompt).not.toContain('fighting');
        expect(safePrompt).not.toContain('combat');
        expect(safePrompt).not.toContain('dangerous');
    });

    test('should transform violent nightmare elements', () => {
        const nightmarePrompt = "Terrifying and dark, nightmare scenario, demon attacking, blood and violence, weapons and combat";
        const safePrompt = sanitizeDallEPrompt(nightmarePrompt);
        
        expect(safePrompt).toContain('mysterious and surreal');
        expect(safePrompt).toContain('shadow figure');
        expect(safePrompt).toContain('life force and vitality');
        expect(safePrompt).toContain('tools of protection');
        expect(safePrompt).toContain('overcoming challenges');
        expect(safePrompt).not.toContain('terrifying');
        expect(safePrompt).not.toContain('demon');
        expect(safePrompt).not.toContain('blood');
        expect(safePrompt).not.toContain('violence');
    });

    test('should preserve safe content unchanged', () => {
        const safePrompt = "Peaceful and serene, flying through clouds, beautiful landscape, person soaring gracefully";
        const result = sanitizeDallEPrompt(safePrompt);
        
        expect(result).toBe(safePrompt);
    });

    test('should handle mixed safe and unsafe content', () => {
        const mixedPrompt = "Beautiful forest setting, fighting wild animals, peaceful nature, violent confrontation";
        const result = sanitizeDallEPrompt(mixedPrompt);
        
        expect(result).toContain('Beautiful forest setting');
        expect(result).toContain('peaceful nature');
        expect(result).toContain('overcoming challenges');
        expect(result).toContain('wild animal encounter');
        expect(result).not.toContain('fighting');
        expect(result).not.toContain('violent confrontation');
    });

    test('should handle death and injury themes symbolically', () => {
        const deathPrompt = "Dying in accident, blood everywhere, traumatic injury, devastating crash";
        const result = sanitizeDallEPrompt(deathPrompt);
        
        expect(result).toContain('transformation and renewal');
        expect(result).toContain('life force and vitality');
        expect(result).toContain('healing and recovery');
        expect(result).toContain('unexpected change');
        expect(result).toContain('profound emotional experience');
        expect(result).not.toContain('dying');
        expect(result).not.toContain('blood');
        expect(result).not.toContain('traumatic');
    });

    test('should handle escape and trapped scenarios', () => {
        const escapePrompt = "Trapped in prison, escaping from danger, running away in fear";
        const result = sanitizeDallEPrompt(escapePrompt);
        
        expect(result).toContain('seeking freedom');
        expect(result).toContain('journey and movement');
        expect(result).toContain('cautious and alert');
        expect(result).not.toContain('trapped');
        expect(result).not.toContain('escaping');
        expect(result).not.toContain('fear');
    });
});