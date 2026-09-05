import { dataStore } from "./dataStore.js";

/**
 * Normalizes text to extract skill tokens
 */
const normalize = (text) => (text || "").toLowerCase().replace(/[^a-z0-9#+.]/g, " ").trim();

/**
 * Standard Tech Skills Dictionary for NLP Extraction
 */
const TECH_SKILLS = [
  "react", "javascript", "typescript", "node", "node.js", "express", "mongodb", "sql", "postgresql",
  "python", "django", "fastapi", "java", "spring", "spring boot", "c#", ".net", "aws", "docker",
  "kubernetes", "graphql", "rest api", "tailwind css", "html", "css", "redux", "zustand", "git",
  "ci/cd", "machine learning", "pytorch", "tensorflow", "nlp", "pandas", "tableau", "figma",
  "ui/ux", "cypress", "jest", "testing", "solidity", "blockchain", "linux", "bash", "networking"
];

/**
 * Extracts recognized skills from arbitrary text
 */
export const extractSkillsFromText = (text) => {
  const norm = normalize(text);
  const found = new Set();
  TECH_SKILLS.forEach((skill) => {
    // word boundary check
    const regex = new RegExp(`(^|\\s)${skill.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}($|\\s)`, "i");
    if (regex.test(norm)) {
      found.add(skill.toUpperCase());
    }
  });
  return Array.from(found);
};

/**
 * AI Resume Analyzer: Compares candidate profile / resume against a target Job Description
 */
export const analyzeResumeAgainstJob = (candidate, job) => {
  const candidateSkills = (candidate.skills || []).map((s) => s.toLowerCase());
  const jobSkills = (job.skills || []).map((s) => s.toLowerCase());

  const matched = [];
  const missing = [];

  jobSkills.forEach((js) => {
    if (candidateSkills.some((cs) => cs.includes(js) || js.includes(cs))) {
      matched.push(js);
    } else {
      missing.push(js);
    }
  });

  const skillScore = jobSkills.length > 0 ? Math.round((matched.length / jobSkills.length) * 100) : 80;

  // Experience match calculation
  let experienceScore = 85;
  const candidateExpYears = (candidate.experience || []).length * 1.5; // estimated 1.5 yrs per role
  if (job.experience) {
    if (job.experience.includes("3-") || job.experience.includes("4-") || job.experience.includes("5-")) {
      experienceScore = candidateExpYears >= 3 ? 95 : 75;
    } else if (job.experience.includes("1-") || job.experience.includes("2-")) {
      experienceScore = candidateExpYears >= 1 ? 95 : 85;
    }
  }

  // Composite match score (65% skills, 35% experience)
  const overallScore = Math.min(99, Math.round(skillScore * 0.65 + experienceScore * 0.35));

  let recommendation = "Moderate Match";
  if (overallScore >= 85) recommendation = "Strong Match";
  else if (overallScore >= 70) recommendation = "Good Match";
  else if (overallScore < 60) recommendation = "Skills Gap Identified";

  return {
    overallScore,
    skillMatchPercentage: skillScore,
    experienceMatchPercentage: experienceScore,
    matchedSkills: matched.map((s) => s.charAt(0).toUpperCase() + s.slice(1)),
    missingSkills: missing.map((s) => s.charAt(0).toUpperCase() + s.slice(1)),
    recommendation,
    summary: `${overallScore}% compatibility based on ${matched.length} overlapping technical competencies.`
  };
};

/**
 * AI Job Recommendations for Candidate
 */
export const getRecommendedJobsForCandidate = async (candidateId) => {
  const candidate = await dataStore.findUserById(candidateId);
  if (!candidate) return [];

  const { jobs } = await dataStore.getJobs({ limit: 50 });
  const userSkills = (candidate.skills || []).map((s) => s.toLowerCase());
  const userLocPref = (candidate.preferences?.preferredLocation || "remote").toLowerCase();
  const userModePref = (candidate.preferences?.workMode || "remote").toLowerCase();

  const scoredJobs = jobs.map((job) => {
    const analysis = analyzeResumeAgainstJob(candidate, job);
    let boost = 0;

    // Location / WorkMode affinity boost
    if ((job.workMode || "").toLowerCase() === userModePref) boost += 5;
    if ((job.location || "").toLowerCase().includes(userLocPref)) boost += 5;

    const finalMatchScore = Math.min(99, analysis.overallScore + boost);

    return {
      ...job,
      matchScore: finalMatchScore,
      matchedSkills: analysis.matchedSkills,
      missingSkills: analysis.missingSkills,
      aiRecommendation: analysis.recommendation
    };
  });

  // Sort descending by match score
  scoredJobs.sort((a, b) => b.matchScore - a.matchScore);
  return scoredJobs.slice(0, 10);
};

/**
 * AI Candidate Ranking for Recruiters
 */
export const rankApplicantsForJob = async (jobId) => {
  const job = await dataStore.getJobById(jobId);
  if (!job) return [];

  const applications = await dataStore.getApplications({ jobId });

  const ranked = await Promise.all(
    applications.map(async (app) => {
      const candidate = await dataStore.findUserById(app.candidateId);
      if (!candidate) {
        return {
          application: app,
          candidate: { name: "Applicant", email: "" },
          matchScore: app.matchScore || 75,
          matchedSkills: [],
          missingSkills: []
        };
      }

      const analysis = analyzeResumeAgainstJob(candidate, job);
      return {
        application: app,
        candidate: {
          _id: candidate._id,
          name: candidate.name,
          email: candidate.email,
          headline: candidate.headline,
          avatar: candidate.avatar,
          skills: candidate.skills,
          experience: candidate.experience,
          education: candidate.education
        },
        matchScore: analysis.overallScore,
        matchedSkills: analysis.matchedSkills,
        missingSkills: analysis.missingSkills,
        experienceScore: analysis.experienceMatchPercentage,
        recommendation: analysis.recommendation
      };
    })
  );

  ranked.sort((a, b) => b.matchScore - a.matchScore);
  return ranked;
};

/**
 * Skill Gap Analysis
 */
export const analyzeSkillGap = (candidate, targetRoleOrJob) => {
  const userSkills = (candidate.skills || []).map((s) => s.toLowerCase());

  let targetSkills = [];
  if (typeof targetRoleOrJob === "string") {
    // Preset target role mappings
    const roleProfiles = {
      "full stack developer": ["react", "node", "mongodb", "docker", "aws", "typescript", "testing"],
      "frontend developer": ["react", "typescript", "tailwind css", "jest", "next.js", "figma"],
      "backend developer": ["node", "express", "sql", "postgresql", "docker", "redis", "microservices"],
      "ai engineer": ["python", "pytorch", "nlp", "machine learning", "fastapi", "docker", "langchain"],
      "devops engineer": ["aws", "docker", "kubernetes", "terraform", "ci/cd", "linux"]
    };
    targetSkills = roleProfiles[targetRoleOrJob.toLowerCase()] || ["react", "node", "docker", "aws"];
  } else if (targetRoleOrJob?.skills) {
    targetSkills = targetRoleOrJob.skills.map((s) => s.toLowerCase());
  }

  const acquired = [];
  const missing = [];

  targetSkills.forEach((ts) => {
    if (userSkills.some((us) => us.includes(ts) || ts.includes(us))) {
      acquired.push(ts.charAt(0).toUpperCase() + ts.slice(1));
    } else {
      missing.push(ts.charAt(0).toUpperCase() + ts.slice(1));
    }
  });

  const learningRoadmap = missing.map((skill) => {
    return {
      skill,
      level: ["Docker", "AWS", "Kubernetes"].includes(skill) ? "Intermediate" : "Beginner",
      estimatedWeeks: 3,
      recommendedTopics: [
        `Core fundamentals and architecture of ${skill}`,
        `Hands-on practical integration in a modern MERN app`,
        `Production deployment and debugging techniques`
      ]
    };
  });

  return {
    target: typeof targetRoleOrJob === "string" ? targetRoleOrJob : targetRoleOrJob.title,
    readinessScore: Math.round((acquired.length / Math.max(1, targetSkills.length)) * 100),
    acquiredSkills: acquired,
    missingSkills: missing,
    learningRoadmap
  };
};
