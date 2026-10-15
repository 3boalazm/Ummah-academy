# Audit · Business & strategy

## 1. Positioning

**Today:** "Learn Islam. Live It. Grow With It." A pleasant line that any mosque, app or charity could use. The real assets are buried in section 2 and on the Teachers page.

**Market reality** (`01-discovery/competitive-research.md`): "Al-Azhar", "1-on-1", "free trial", "female teachers" and "24/7" are table stakes every competitor claims.

**What only Ummah Academy can credibly say (if verified):**

1. Every teacher holds an **Ijazah with a documented Sanad**, and the academy publishes a **four-stage vetting process**, including a Sanad check and a live teaching demo.
2. A named method, **Itqan** (thematic grouping plus Tadabbur), with an explainer article.
3. **Transparent, lower prices at high frequency**: 4×/week at $59 vs about $80 at comparable academies.
4. Product touches: a **placement test** and a **Family Portal**.

**Recommended positioning statement (internal):**

> For Muslim families and adults outside the Arab world who want to read, recite and understand the Qur'an properly, Ummah Academy offers live 1-on-1 lessons with Al-Azhar scholars who hold a verified chain of transmission. Unlike tutoring marketplaces and generic academies, every teacher is vetted for both Sanad and the patience to teach, and you can try two full lessons before paying anything.

**Hero line chosen for v2:** *"The Qur'an, taught the way it was transmitted."* It is calm, confident, specific and rooted in the Sanad story.

## 2. Segments and jobs-to-be-done

| Segment | Job | What they need to see first | Route |
|---|---|---|---|
| Parents of 5–14-year-olds (largest; testimonials, Cubs, Family Portal) | "Give my child a love for the Qur'an without a fight" | Safety (female teachers, recordings), fun (games), 30-min sessions, progress visibility | `/ummah-cubs-kids-islamic-studies/` |
| Adult beginners / reverts | "Finally read the Qur'an correctly, without embarrassment" | Patience, zero-Arabic friendly, private 1-on-1 | Recitation / Noor Al-Bayan |
| Adults improving recitation | "Fix my Tajweed" | Live correction, structured levels | Recitation & Tajweed |
| Serious memorisers | "Memorise and earn an Ijazah" | Sanad, method, realistic timeline | Hifz & Ijazah |
| Learners of understanding | "Understand what I recite" | Classical grammar path, scholars who answer questions | Arabic / Islamic Studies |

## 3. Offer and pricing architecture

| Plan (live) | Length | /week | Sessions/mo | $/mo | $/session | $/hour |
|---|---|---|---|---|---|---|
| Launch | 30 | 2 | 8 | 40 | 5.00 | 10.00 |
| Consistent | 30 | 4 | 16 | 59 | 3.69 | 7.38 |
| Deen | 30 | 4 | 16 | 59 | 3.69 | 7.38 |
| Elite | 30 | 5 | 20 | 74 | 3.70 | 7.40 |
| Starter | 60 | 1 | 4–5 | 64 | ~14.2 | ~14.2 |
| Gold | 60 | 2 | 8 | 96 | 12.00 | 12.00 |
| Diamond | 60 | 3 | 12 | 128 | 10.67 | 10.67 |

**Observations**

- **Deen duplicates Consistent.** Same length, frequency and price; only the subject differs. The subject is chosen in the trial anyway. → Present Track B as **3 frequencies** (2/4/5 per week); Deen becomes "any subject, including Islamic studies".
- **60-minute hours cost about 45–90% more than 30-minute hours.** This is defensible (adult depth, Hifz), but the site never explains *why* to choose 60. → Add a one-line rule: *30 min for children and focused practice; 60 min for adults, Tajweed and Hifz.*
- **No 3×/week 30-min option.** The jump from 2×/week ($40) to 4×/week ($59) is large. Business may consider a 3×/week tier (~$50). This is a backlog suggestion and was not invented on the site.
- **Missing levers competitors use:** money-back guarantee (30 days at one competitor) and a sibling/family discount (10%). These fit the Family Portal story strongly. → Backlog; requires a business decision.

## 4. Trust and risk register

| Risk | Exposure | v2 action | Owner |
|---|---|---|---|
| "ICESCO Aligned", "GDPR Compliant" badges | Regulatory or consumer-protection challenge if unprovable | Removed. Privacy is described factually instead. | Business to confirm |
| 100+ scholars vs 3 profiled | Credibility gap for careful parents | Teachers page reframed as "department leads"; the "3 Ijazah-holding scholars" stat removed | Business to provide roster count |
| 95% vs 85% satisfaction | Looks invented | Only one metric kept ("95% continue after the first paid month"), labelled as an academy figure | Business to evidence |
| Testimonials and Hall of Fame | Consent and authenticity | Testimonials kept with initials avatars; Hall of Fame removed from home | Business to confirm consent |
| Recordings promised, portal "coming soon" | Expectation gap → churn and complaints | Copy says recordings are available on request / via the portal as it rolls out; "coming soon" labels kept | Product |
| Two phone numbers, two email domains (live) | Leads lost, phishing perception | One canonical contact in `src/data/site.ts` | Business to confirm |
| Placement test is authored content | Academic accuracy | Flagged for review by the Tajweed department | Academic lead |

## 5. KPIs the site should move

- **Primary:** trial requests per 100 visitors, by segment (child vs adult).
- **Quality:** requests → confirmed trials → paid (the business claims 95% retention after the first paid month; measure it).
- **Efficiency:** cost per confirmed trial by channel (requires UTM capture; implemented).
