/**
 * Tests for Landing Page
 * Validates all requirements from the landing-page-update spec
 */

import * as fc from "fast-check";
import * as fs from "fs";
import * as path from "path";

// Read the page source file for testing
const pageSourcePath = path.join(__dirname, "../page.tsx");
const pageSource = fs.readFileSync(pageSourcePath, "utf-8");

// Helper to count occurrences of a pattern
const countOccurrences = (str: string, pattern: string | RegExp): number => {
  if (typeof pattern === "string") {
    const regex = new RegExp(
      pattern.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
      "g"
    );
    return (str.match(regex) || []).length;
  }
  return (str.match(pattern) || []).length;
};

// Helper to check if content exists in source
const hasContent = (content: string): boolean => {
  return pageSource.includes(content);
};

describe("Landing Page - Unit Tests", () => {
  describe("Requirement 1.1: Display at least six distinct content sections", () => {
    it("should have at least 6 major sections defined", () => {
      // Count major sections by looking for section elements and IDs
      const sections = [
        hasContent("Hero Section") || hasContent("Modern Farming"),
        hasContent("Stats Section") || hasContent("500+"),
        hasContent('id="features"') || hasContent("Features Section"),
        hasContent('id="how-it-works"') || hasContent("How It Works Section"),
        hasContent('id="blockchain"') ||
          hasContent("Blockchain Integration Section"),
        hasContent('id="testimonials"') || hasContent("Testimonials Section"),
        hasContent("CTA Section") || hasContent("Ready to Transform"),
      ];

      const sectionCount = sections.filter(Boolean).length;
      expect(sectionCount).toBeGreaterThanOrEqual(6);
    });
  });

  describe("Requirement 1.2: Include 'How it Works' section", () => {
    it("should include a section with id 'how-it-works'", () => {
      expect(hasContent('id="how-it-works"')).toBe(true);
    });

    it("should display 'How It Works' heading", () => {
      expect(hasContent("How It Works")).toBe(true);
    });

    it("should have workflow steps defined", () => {
      expect(hasContent("workflowSteps")).toBe(true);
    });
  });

  describe("Requirement 1.3: Include 'Testimonials' section", () => {
    it("should include a section with id 'testimonials'", () => {
      expect(hasContent('id="testimonials"')).toBe(true);
    });

    it("should display testimonials heading", () => {
      expect(hasContent("What Our Users Say")).toBe(true);
    });

    it("should have testimonials data defined", () => {
      expect(hasContent("const testimonials")).toBe(true);
    });
  });

  describe("Requirement 1.4: Present multi-chain blockchain support", () => {
    it("should mention both Hedera and Cardano", () => {
      expect(hasContent("Hedera")).toBe(true);
      expect(hasContent("Cardano")).toBe(true);
    });

    it("should mention multi-chain support", () => {
      const hasMultiChain =
        hasContent("Multi-Chain") ||
        hasContent("multi-chain") ||
        hasContent("2 Chains");
      expect(hasMultiChain).toBe(true);
    });
  });

  describe("Requirement 1.5: Maintain existing navigation, hero, and footer", () => {
    it("should have navigation component", () => {
      expect(hasContent("<nav")).toBe(true);
      expect(hasContent("HarvestLedger")).toBe(true);
    });

    it("should have hero section", () => {
      expect(hasContent("Modern Farming")).toBe(true);
      expect(hasContent("Meets Blockchain")).toBe(true);
    });

    it("should have footer", () => {
      expect(hasContent("<footer")).toBe(true);
    });
  });

  describe("Requirement 2.1: Display minimum of three sequential workflow steps", () => {
    it("should have at least 5 workflow steps defined", () => {
      // Check for workflowSteps array with at least 5 items
      const workflowMatch = pageSource.match(
        /const workflowSteps[\s\S]*?\[[\s\S]*?\]/
      );
      expect(workflowMatch).toBeTruthy();

      // Count step objects
      const stepCount = countOccurrences(pageSource, /number:\s*\d+/g);
      expect(stepCount).toBeGreaterThanOrEqual(5);
    });

    it("should have steps covering complete user journey", () => {
      expect(hasContent("Register")).toBe(true);
      expect(hasContent("Connect Wallet")).toBe(true);
      expect(hasContent("Record Harvest")).toBe(true);
      expect(hasContent("Tokenize")).toBe(true);
      expect(hasContent("Track Supply Chain")).toBe(true);
    });
  });

  describe("Requirement 2.2: Include visual indicators for each step", () => {
    it("should include number property for each workflow step", () => {
      const numberCount = countOccurrences(pageSource, /number:\s*\d+/g);
      expect(numberCount).toBeGreaterThanOrEqual(5);
    });

    it("should include icon property for each workflow step", () => {
      const iconCount = countOccurrences(pageSource, /icon:\s*\w+/g);
      expect(iconCount).toBeGreaterThanOrEqual(5);
    });
  });

  describe("Requirement 2.3: Present complete user journey", () => {
    it("should cover registration to blockchain verification", () => {
      expect(hasContent("Register")).toBe(true);
      expect(hasContent("Verify")).toBe(true);
    });
  });

  describe("Requirement 2.4: Use clear, non-technical language", () => {
    it("should have descriptive step descriptions", () => {
      expect(hasContent("description:")).toBe(true);
      // Check that descriptions are present in workflow steps
      const descriptionCount = countOccurrences(
        pageSource,
        /description:\s*"/g
      );
      expect(descriptionCount).toBeGreaterThanOrEqual(5);
    });
  });

  describe("Requirement 2.5: Explain workflows for multiple user roles", () => {
    it("should include userRole property for workflow steps", () => {
      expect(hasContent("userRole:")).toBe(true);
      expect(hasContent("All Users")).toBe(true);
      expect(hasContent("Farmers")).toBe(true);
      expect(hasContent("Buyers")).toBe(true);
    });
  });

  describe("Requirement 3.1: Display at least three user testimonials", () => {
    it("should have testimonials array with at least 3 items", () => {
      const testimonialMatches = pageSource.match(
        /const testimonials[\s\S]*?\[[\s\S]*?\]/
      );
      expect(testimonialMatches).toBeTruthy();

      // Count testimonial objects by looking for quote properties
      const quoteCount = countOccurrences(pageSource, /quote:\s*"/g);
      expect(quoteCount).toBeGreaterThanOrEqual(3);
    });
  });

  describe("Requirement 3.2: Include user name and role for each testimonial", () => {
    it("should have author property for each testimonial", () => {
      const authorCount = countOccurrences(pageSource, /author:\s*"/g);
      expect(authorCount).toBeGreaterThanOrEqual(3);
    });

    it("should have role property for each testimonial", () => {
      const roleCount = countOccurrences(pageSource, /role:\s*"/g);
      expect(roleCount).toBeGreaterThanOrEqual(3);
    });

    it("should include specific testimonial authors", () => {
      expect(hasContent("Sarah Kimani")).toBe(true);
      expect(hasContent("James Omondi")).toBe(true);
      expect(hasContent("Maria Santos")).toBe(true);
    });
  });

  describe("Requirement 3.3: Present authentic-sounding feedback", () => {
    it("should have quote text for each testimonial", () => {
      expect(hasContent("transformed")).toBe(true);
      expect(hasContent("transparency")).toBe(true);
    });
  });

  describe("Requirement 3.4: Represent diverse user types", () => {
    it("should include testimonials from farmers, buyers, and cooperatives", () => {
      expect(hasContent("Coffee Farmer")).toBe(true);
      expect(hasContent("Agricultural Buyer")).toBe(true);
      expect(hasContent("Cooperative Manager")).toBe(true);
    });
  });

  describe("Requirement 3.5: Use visual design elements", () => {
    it("should use Card components for testimonials", () => {
      // Check that testimonials section uses Card components
      const testimonialsSection = pageSource.match(
        /id="testimonials"[\s\S]*?<\/section>/
      );
      expect(testimonialsSection).toBeTruthy();
      expect(testimonialsSection![0]).toContain("Card");
    });

    it("should include Quote icon", () => {
      expect(hasContent("Quote")).toBe(true);
    });
  });

  describe("Requirement 4.1: Mention both Hedera and Cardano blockchain support", () => {
    it("should mention Hedera blockchain", () => {
      expect(hasContent("Hedera")).toBe(true);
    });

    it("should mention Cardano blockchain", () => {
      expect(hasContent("Cardano")).toBe(true);
    });
  });

  describe("Requirement 4.2: Explain specific use cases for each blockchain", () => {
    it("should mention HCS for Hedera", () => {
      const hasHCS = hasContent("HCS") || hasContent("Consensus Service");
      expect(hasHCS).toBe(true);
    });

    it("should mention HTS for Hedera", () => {
      const hasHTS = hasContent("HTS") || hasContent("Token Service");
      expect(hasHTS).toBe(true);
    });

    it("should mention native tokens for Cardano", () => {
      const hasNativeTokens =
        hasContent("Native Token") || hasContent("native token");
      expect(hasNativeTokens).toBe(true);
    });

    it("should mention metadata for Cardano", () => {
      expect(hasContent("metadata")).toBe(true);
    });
  });

  describe("Requirement 4.3: Use terminology consistent with implementation", () => {
    it("should use correct Hedera terminology", () => {
      expect(hasContent("Hedera Consensus Service") || hasContent("HCS")).toBe(
        true
      );
      expect(hasContent("Hedera Token Service") || hasContent("HTS")).toBe(
        true
      );
    });

    it("should use correct Cardano terminology", () => {
      expect(hasContent("Plutus")).toBe(true);
      expect(hasContent("UTxO")).toBe(true);
    });
  });

  describe("Requirement 4.4: Highlight immutability, transparency, and verification", () => {
    it("should mention immutability", () => {
      expect(hasContent("immutable") || hasContent("Immutable")).toBe(true);
    });

    it("should mention transparency", () => {
      expect(hasContent("transparency") || hasContent("Transparency")).toBe(
        true
      );
    });

    it("should mention verification", () => {
      expect(
        hasContent("verify") ||
          hasContent("Verify") ||
          hasContent("verification")
      ).toBe(true);
    });
  });

  describe("Requirement 5.1: Display all sections in responsive layout", () => {
    it("should use responsive Tailwind classes", () => {
      expect(hasContent("md:")).toBe(true);
      expect(hasContent("lg:")).toBe(true);
    });
  });

  describe("Requirement 5.2: Adjust section layouts on mobile", () => {
    it("should have mobile-specific layout classes", () => {
      expect(hasContent("sm:") || hasContent("flex-col")).toBe(true);
    });
  });

  describe("Requirement 5.3: Stack columns vertically on smaller screens", () => {
    it("should use grid with responsive columns", () => {
      expect(hasContent("grid")).toBe(true);
      expect(hasContent("md:grid-cols") || hasContent("lg:grid-cols")).toBe(
        true
      );
    });
  });

  describe("Requirement 5.4: Maintain Tailwind CSS styling", () => {
    it("should use Tailwind utility classes", () => {
      expect(hasContent("className=")).toBe(true);
      expect(hasContent("bg-")).toBe(true);
      expect(hasContent("text-")).toBe(true);
    });
  });

  describe("Requirement 5.5: Use emerald/green color scheme", () => {
    it("should use emerald color classes", () => {
      expect(hasContent("emerald")).toBe(true);
      expect(hasContent("green")).toBe(true);
    });

    it("should use gradient classes with emerald/green", () => {
      expect(hasContent("from-emerald") || hasContent("to-green")).toBe(true);
    });
  });

  describe("Requirement 6.1: Scroll to corresponding section when navigation link clicked", () => {
    it("should have href attributes with section anchors", () => {
      expect(hasContent('href="#features"')).toBe(true);
      expect(hasContent('href="#how-it-works"')).toBe(true);
      expect(hasContent('href="#blockchain"')).toBe(true);
      expect(hasContent('href="#testimonials"')).toBe(true);
    });
  });

  describe("Requirement 6.2: Include links for all major sections", () => {
    it("should have navigation links for How It Works and Testimonials", () => {
      expect(hasContent('href="#how-it-works"')).toBe(true);
      expect(hasContent('href="#testimonials"')).toBe(true);
    });
  });

  describe("Requirement 7.1: Show at least four key metrics", () => {
    it("should display at least 4 statistics", () => {
      expect(hasContent("500+")).toBe(true);
      expect(hasContent("2 Chains")).toBe(true);
      expect(hasContent("99.9%")).toBe(true);
      expect(hasContent("24/7")).toBe(true);
    });
  });

  describe("Requirement 7.2: Include relevant metrics", () => {
    it("should show farms connected metric", () => {
      expect(hasContent("Farms Connected")).toBe(true);
    });

    it("should show blockchain networks metric", () => {
      expect(hasContent("Blockchain Networks")).toBe(true);
    });
  });

  describe("Requirement 8.1: Display CTA buttons in at least three locations", () => {
    it("should have multiple CTA buttons throughout the page", () => {
      const ctaCount =
        countOccurrences(pageSource, "Get Started") +
        countOccurrences(pageSource, "Start Free Trial") +
        countOccurrences(pageSource, "Schedule Demo") +
        countOccurrences(pageSource, "Watch Demo");

      expect(ctaCount).toBeGreaterThanOrEqual(3);
    });
  });

  describe("Requirement 8.2: Use action-oriented text for CTAs", () => {
    it("should have action-oriented CTA button text", () => {
      expect(hasContent("Get Started")).toBe(true);
      expect(hasContent("Start Free Trial")).toBe(true);
      expect(hasContent("Schedule Demo")).toBe(true);
    });
  });

  describe("Requirement 8.3: Navigate to appropriate pages", () => {
    it("should have CTA links to authentication pages", () => {
      expect(hasContent("/auth/signin")).toBe(true);
    });

    it("should have query parameters for different CTA types", () => {
      expect(hasContent("type=trial") || hasContent("type=demo")).toBe(true);
    });
  });

  describe("Requirement 8.4: Use emerald/green gradient for CTAs", () => {
    it("should use gradient styling for primary CTAs", () => {
      expect(hasContent("from-emerald-600 to-green-600")).toBe(true);
    });
  });
});

describe("Landing Page - Property-Based Tests", () => {
  /**
   * Feature: landing-page-update, Property 1: Section Count Completeness
   * Validates: Requirements 1.1
   */
  describe("Property 1: Section Count Completeness", () => {
    it("should always contain at least 6 distinct content sections", () => {
      fc.assert(
        fc.property(fc.constant(null), () => {
          // Count major sections
          const sections = [
            hasContent("Hero Section") || hasContent("Modern Farming"),
            hasContent("Stats Section") || hasContent("500+"),
            hasContent('id="features"') || hasContent("Features Section"),
            hasContent('id="how-it-works"') ||
              hasContent("How It Works Section"),
            hasContent('id="blockchain"') ||
              hasContent("Blockchain Integration Section"),
            hasContent('id="testimonials"') ||
              hasContent("Testimonials Section"),
            hasContent("CTA Section") || hasContent("Ready to Transform"),
          ];

          const sectionCount = sections.filter(Boolean).length;
          return sectionCount >= 6;
        }),
        { numRuns: 100 }
      );
    });
  });

  /**
   * Feature: landing-page-update, Property 2: Required Section Presence
   * Validates: Requirements 1.2, 1.3
   */
  describe("Property 2: Required Section Presence", () => {
    it("should always include both 'How it Works' and 'Testimonials' sections", () => {
      fc.assert(
        fc.property(fc.constant(null), () => {
          const hasHowItWorks =
            hasContent('id="how-it-works"') || hasContent("How It Works");
          const hasTestimonials =
            hasContent('id="testimonials"') || hasContent("What Our Users Say");

          return hasHowItWorks && hasTestimonials;
        }),
        { numRuns: 100 }
      );
    });
  });

  /**
   * Feature: landing-page-update, Property 3: Multi-Chain Information Consistency
   * Validates: Requirements 1.4, 4.1
   */
  describe("Property 3: Multi-Chain Information Consistency", () => {
    it("should always reference both Hedera and Cardano blockchains", () => {
      fc.assert(
        fc.property(fc.constant(null), () => {
          const hasHedera = hasContent("Hedera");
          const hasCardano = hasContent("Cardano");

          return hasHedera && hasCardano;
        }),
        { numRuns: 100 }
      );
    });
  });

  /**
   * Feature: landing-page-update, Property 4: Navigation Link Completeness
   * Validates: Requirements 6.2
   */
  describe("Property 4: Navigation Link Completeness", () => {
    it("should have navigation links for all major sections", () => {
      fc.assert(
        fc.property(fc.constant(null), () => {
          const requiredLinks = [
            "#features",
            "#how-it-works",
            "#blockchain",
            "#testimonials",
          ];

          return requiredLinks.every((link) => hasContent(`href="${link}"`));
        }),
        { numRuns: 100 }
      );
    });
  });

  /**
   * Feature: landing-page-update, Property 5: Workflow Step Sequencing
   * Validates: Requirements 2.1
   */
  describe("Property 5: Workflow Step Sequencing", () => {
    it("should have workflow steps numbered sequentially from 1", () => {
      fc.assert(
        fc.property(fc.constant(null), () => {
          // Check for sequential numbering in workflow steps
          const hasStep1 = /number:\s*1[,\s]/.test(pageSource);
          const hasStep2 = /number:\s*2[,\s]/.test(pageSource);
          const hasStep3 = /number:\s*3[,\s]/.test(pageSource);
          const hasStep4 = /number:\s*4[,\s]/.test(pageSource);
          const hasStep5 = /number:\s*5[,\s]/.test(pageSource);

          // Should have steps 1-5 in sequence
          return hasStep1 && hasStep2 && hasStep3 && hasStep4 && hasStep5;
        }),
        { numRuns: 100 }
      );
    });
  });

  /**
   * Feature: landing-page-update, Property 6: Testimonial Diversity
   * Validates: Requirements 3.4
   */
  describe("Property 6: Testimonial Diversity", () => {
    it("should represent at least two different user roles", () => {
      fc.assert(
        fc.property(fc.constant(null), () => {
          const roles = [
            hasContent("Farmer"),
            hasContent("Buyer"),
            hasContent("Cooperative"),
            hasContent("Manager"),
          ];

          const roleCount = roles.filter(Boolean).length;
          return roleCount >= 2;
        }),
        { numRuns: 100 }
      );
    });
  });

  /**
   * Feature: landing-page-update, Property 7: Responsive Layout Adaptation
   * Validates: Requirements 5.2, 5.3
   */
  describe("Property 7: Responsive Layout Adaptation", () => {
    it("should use responsive Tailwind classes for layout", () => {
      fc.assert(
        fc.property(fc.constant(null), () => {
          // Check for responsive classes (md:, lg:, sm:)
          const hasResponsiveClasses =
            hasContent("md:") || hasContent("lg:") || hasContent("sm:");

          // Check for grid/flex layouts that adapt
          const hasResponsiveLayout = hasContent("grid") || hasContent("flex");

          return hasResponsiveClasses && hasResponsiveLayout;
        }),
        { numRuns: 100 }
      );
    });
  });

  /**
   * Feature: landing-page-update, Property 8: CTA Button Presence
   * Validates: Requirements 8.1
   */
  describe("Property 8: CTA Button Presence", () => {
    it("should have at least 3 CTA buttons distributed across sections", () => {
      fc.assert(
        fc.property(fc.constant(null), () => {
          const ctaTexts = [
            "Get Started",
            "Start Free Trial",
            "Schedule Demo",
            "Watch Demo",
            "Sign In",
          ];

          let ctaCount = 0;
          ctaTexts.forEach((text) => {
            if (hasContent(text)) {
              ctaCount++;
            }
          });

          return ctaCount >= 3;
        }),
        { numRuns: 100 }
      );
    });
  });
});
