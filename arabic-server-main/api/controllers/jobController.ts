import { Request, Response } from "express";
import slugify from "slugify";
import Job from "../models/job";

// Helper to build a unique slug
const buildUniqueSlug = async (title: string, excludeId?: unknown) => {
  let baseSlug = slugify(title, { lower: true, strict: true, trim: true });
  if (baseSlug.length > 70) baseSlug = baseSlug.substring(0, 70);
  if (!baseSlug) baseSlug = "job";

  let slug = baseSlug;
  let counter = 1;
  const scope = excludeId ? { _id: { $ne: excludeId } } : {};
  while (await Job.exists({ slug, ...scope })) {
    slug = `${baseSlug}-${counter++}`;
  }
  return slug;
};

// Default seed data
const DEFAULT_JOBS = [
  {
    title: "Academic Support Assistant",
    slug: "academic-support-assistant",
    department: "Management",
    jobLocation: "Online",
    employmentType: "Permanent",
    jobType: "3 years exp.",
    experience: "Minimum 1-2 Years",
    schedule: "Flexible Hours",
    description: "Are you organized, reliable, and passionate about education? We are seeking a proactive Online Academic Support Assistant to support the smooth operation of our online academy. In this role, you’ll play a vital part in coordinating between students, teachers, and internal teams to ensure a high-quality educational experience. From academic support to administrative coordination, your efforts will directly impact student satisfaction and learning success.",
    responsibilities: [
      {
        category: "Academic and Student Support",
        items: [
          "Assist students with academic queries, and scheduling through email, chat, or the academy’s learning platform.",
          "Maintain updated academic resources such as worksheets, summaries, and course materials.",
          "Track student attendance and follow up with students who miss classes."
        ]
      },
      {
        category: "Administrative Coordination",
        items: [
          "Manage and update schedules for teachers and students, including rescheduling and cancellations.",
          "Schedule and follow up on trial sessions for new students.",
          "Handle invoice creation and management, including tracking payments and sending reminders.",
          "Maintain student and teacher databases with accuracy and confidentiality."
        ]
      },
      {
        category: "Teacher and Student Management",
        items: [
          "Support onboarding of new students and teachers with orientation and required documentation.",
          "Monitor teacher availability and ensure class schedules are well-coordinated.",
          "Follow up on teacher performance reports and communicate feedback when required."
        ]
      },
      {
        category: "Internal Team Coordination",
        items: [
          "Act as a communication bridge between academic, administrative, and technical teams.",
          "Follow up on pending issues and ensure timely resolution for smooth academic delivery.",
          "Assist in managing online platforms, Zoom links, digital folders, and communication tools."
        ]
      },
      {
        category: "The Successful Applicant",
        items: [
          "Has excellent written and verbal communication skills in English.",
          "Minimum 2 years of experience in academic support, administration, customer service, or an education-related role.",
          "Should have a detail-oriented, organized, and responsive with strong follow-up skills.",
          "Can manage multiple priorities in a remote work environment.",
          "Proficient in MS Teams, Google Workspace, Zoom, spreadsheets, and basic invoicing or CRM tools.",
          "Ability to assist in basic tech troubleshooting during live sessions.",
          "Experience in an online tutoring platform or e-learning environment."
        ]
      }
    ],
    applyLabel: "Apply Now",
    applyUrl: "/teacher-registration",
    status: "published",
    order: 0
  },
  {
    title: "Academic Head",
    slug: "academic-head",
    department: "Management",
    jobLocation: "Online",
    employmentType: "Permanent",
    jobType: "2-4 Years Exp.",
    experience: "Minimum 2-5 Years",
    schedule: "Flexible Hours",
    description: "We are seeking an experienced Academic Head to lead our online Arabic tuition programs in the UAE. This strategic role involves overseeing curriculum development, teacher training, and quality assurance to ensure exceptional learning outcomes for students of all ages and proficiency levels.",
    responsibilities: [
      {
        category: "Academic Leadership & Strategy",
        items: [
          "Design and implement a structured online Arabic curriculum for beginner to advanced learners (MSA/dialects).",
          "Align programs with UAE educational standards (MOE, IGCSE, IB, etc.) for exam-focused students.",
          "Develop teaching methodologies tailored for virtual learning environments."
        ]
      },
      {
        category: "Teacher Management & Training",
        items: [
          "Recruit, train, and mentor online Arabic tutors to deliver engaging, student-centered lessons.",
          "Conduct regular teaching observations and provide feedback to maintain instructional quality.",
          "Organize professional development workshops on EdTech tools and best practices."
        ]
      },
      {
        category: "Quality Assurance & Student Success",
        items: [
          "Monitor student progress through assessments, feedback, and performance analytics.",
          "Ensure consistency in teaching standards across all tutors and courses.",
          "Address academic concerns from students/parents and implement improvement plans."
        ]
      },
      {
        category: "Operational Support",
        items: [
          "Collaborate with the operations team to optimize scheduling, pricing, and course offerings.",
          "Oversee the creation of digital learning resources (lesson plans, quizzes, interactive content).",
          "Stay updated on e-learning trends and integrate innovative tools (AI, gamification, etc.)."
        ]
      },
      {
        category: "Requirements",
        items: [
          "Master’s degree in Arabic, Education, Linguistics, or a related field.",
          "5+ years of experience in Arabic teaching/tutoring, including 2+ years in leadership (online education preferred).",
          "Deep knowledge of UAE curricula (MOE, British, IB, American) and exam requirements.",
          "Proficiency in Education tools (Zoom, LMS, Canva, Google Classroom).",
          "Strong leadership, communication, and problem-solving skills.",
          "Fluent in Arabic and English (additional languages a plus)."
        ]
      },
      {
        category: "Why Join Us?",
        items: [
          "Lead a growing online Arabic education initiative with a global student base.",
          "Flexible remote work with a competitive salary and performance bonuses.",
          "Opportunity to shape Arabic e-learning standards in the UAE."
        ]
      }
    ],
    applyLabel: "Apply Now",
    applyUrl: "/teacher-registration",
    status: "published",
    order: 1
  },
  {
    title: "Arabic Teacher",
    slug: "academic-teacher",
    department: "Management",
    jobLocation: "Online",
    employmentType: "Permanent",
    jobType: "2-3 Years UAE Exp.",
    experience: "Minimum 2 Years",
    schedule: "Flexible Hours",
    description: "We are looking for qualified Arabic language instructors to deliver high-quality online tuition to students across the UAE. This remote teaching position offers the opportunity to work with diverse learners in a virtual classroom environment.",
    responsibilities: [
      {
        category: "Responsibilities",
        items: [
          "Deliver engaging online Arabic lessons via MS Teams/Zoom/GMeet",
          "Teach Modern Standard Arabic (MSA) or dialects as required",
          "Develop personalized lesson plans based on student needs",
          "Utilize interactive digital tools (Google Classroom, Kahoot, Canva)",
          "Assess student progress and provide constructive feedback",
          "Maintain accurate attendance and performance records"
        ]
      },
      {
        category: "Essential",
        items: [
          "Bachelor's degree in Arabic Language, Education, Linguistics or related field",
          "Teaching certification (TAFL, CELTA, PGCE, or equivalent)",
          "Minimum 2 years Arabic teaching experience (online preferred)",
          "Native or near-native Arabic proficiency (MSA and/or dialects)",
          "Excellent command of English",
          "Strong technical skills with video conferencing platforms"
        ]
      },
      {
        category: "Preferred",
        items: [
          "Master's degree in Arabic or Education",
          "Experience with UAE curricula like MOE, IGCSE, IB, CBSE, ICSE etc.",
          "Additional language skills (English, Urdu, Malayalam, Tamil, Arabic, etc.)",
          "Certification in online teaching methodologies"
        ]
      },
      {
        category: "Technical Requirements",
        items: [
          "Stable high-speed internet connection",
          "Quiet, professional teaching environment.",
          "HD webcam and quality microphone",
          "Backup power/internet solution"
        ]
      },
      {
        category: "We Offer",
        items: [
          "Competitive hourly rates",
          "Flexible teaching schedule",
          "Ongoing professional development",
          "Supportive virtual teaching community"
        ]
      }
    ],
    applyLabel: "Apply Now",
    applyUrl: "/teacher-registration",
    status: "published",
    order: 2
  }
];

// Helper to seed default jobs if database is empty
const seedDefaultJobsIfNeeded = async () => {
  const count = await Job.countDocuments();
  if (count === 0) {
    console.log("Seeding default jobs into the database...");
    await Job.insertMany(DEFAULT_JOBS);
  }
};

// GET: Fetch all published jobs (Public)
export const getJobs = async (req: Request, res: Response): Promise<any> => {
  try {
    await seedDefaultJobsIfNeeded();
    const jobs = await Job.find({ status: "published" }).sort({ order: 1, createdAt: -1 });
    res.status(200).json({ success: true, data: jobs });
  } catch (error) {
    console.error("Error fetching jobs:", error);
    res.status(500).json({ success: false, message: "Failed to fetch jobs" });
  }
};

// GET: Fetch single job by slug (Public)
export const getJobBySlug = async (req: Request, res: Response): Promise<any> => {
  try {
    await seedDefaultJobsIfNeeded();
    const job = await Job.findOne({ slug: req.params.slug, status: "published" });
    if (!job) {
      return res.status(404).json({ success: false, message: "Job not found" });
    }
    res.status(200).json({ success: true, data: job });
  } catch (error) {
    console.error("Error fetching job details:", error);
    res.status(500).json({ success: false, message: "Server error fetching job details" });
  }
};

// GET: Fetch all jobs (Admin Only)
export const getAdminJobs = async (req: Request, res: Response): Promise<any> => {
  try {
    await seedDefaultJobsIfNeeded();
    const jobs = await Job.find().sort({ order: 1, createdAt: -1 });
    res.status(200).json({ success: true, data: jobs });
  } catch (error) {
    console.error("Error fetching admin jobs list:", error);
    res.status(500).json({ success: false, message: "Failed to fetch jobs list" });
  }
};

// GET: Fetch single job by ID (Admin Only)
export const getJobById = async (req: Request, res: Response): Promise<any> => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) {
      return res.status(404).json({ success: false, message: "Job position not found" });
    }
    res.status(200).json({ success: true, data: job });
  } catch (error) {
    console.error("Error fetching job by ID:", error);
    res.status(500).json({ success: false, message: "Server error fetching job" });
  }
};

// POST: Create a new job (Admin Only)
export const createJob = async (req: Request, res: Response): Promise<any> => {
  try {
    const {
      title,
      department,
      jobLocation,
      employmentType,
      jobType,
      experience,
      schedule,
      description,
      responsibilities,
      applyLabel,
      applyUrl,
      status,
      order,
    } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({ success: false, message: "Title is required" });
    }
    if (!description || !description.trim()) {
      return res.status(400).json({ success: false, message: "Description is required" });
    }

    const slug = await buildUniqueSlug(title);

    const newJob = new Job({
      title: title.trim(),
      slug,
      department: department?.trim() || "Management",
      jobLocation: jobLocation?.trim() || "Online",
      employmentType: employmentType?.trim() || "Permanent",
      jobType: jobType?.trim() || "3 years exp.",
      experience: experience?.trim() || "Minimum 1-2 Years",
      schedule: schedule?.trim() || "Flexible Hours",
      description: description.trim(),
      responsibilities: responsibilities || [],
      applyLabel: applyLabel?.trim() || "Apply Now",
      applyUrl: applyUrl?.trim() || "/teacher-registration",
      status: status || "published",
      order: order !== undefined ? Number(order) : 0,
    });

    await newJob.save();

    res.status(201).json({
      success: true,
      message: "Job opening created successfully!",
      data: newJob,
    });
  } catch (error) {
    console.error("Error creating job:", error);
    res.status(500).json({ success: false, message: "Server error creating job opening" });
  }
};

// PUT: Update job opening (Admin Only)
export const updateJob = async (req: Request, res: Response): Promise<any> => {
  try {
    const {
      title,
      department,
      jobLocation,
      employmentType,
      jobType,
      experience,
      schedule,
      description,
      responsibilities,
      applyLabel,
      applyUrl,
      status,
      order,
    } = req.body;

    const job = await Job.findById(req.params.id);
    if (!job) {
      return res.status(404).json({ success: false, message: "Job position not found" });
    }

    if (title && title.trim() && title !== job.title) {
      job.title = title.trim();
      job.slug = await buildUniqueSlug(title, job._id);
    }

    if (department !== undefined) job.department = department.trim() || "Management";
    if (jobLocation !== undefined) job.jobLocation = jobLocation.trim() || "Online";
    if (employmentType !== undefined) job.employmentType = employmentType.trim() || "Permanent";
    if (jobType !== undefined) job.jobType = jobType.trim();
    if (experience !== undefined) job.experience = experience.trim();
    if (schedule !== undefined) job.schedule = schedule.trim() || "Flexible Hours";
    if (description !== undefined) job.description = description.trim();
    if (responsibilities !== undefined) job.responsibilities = responsibilities;
    if (applyLabel !== undefined) job.applyLabel = applyLabel.trim() || "Apply Now";
    if (applyUrl !== undefined) job.applyUrl = applyUrl.trim() || "/teacher-registration";
    if (status !== undefined) job.status = status;
    if (order !== undefined) job.order = Number(order);

    await job.save();

    res.status(200).json({
      success: true,
      message: "Job opening updated successfully!",
      data: job,
    });
  } catch (error) {
    console.error("Error updating job:", error);
    res.status(500).json({ success: false, message: "Server error updating job opening" });
  }
};

// DELETE: Remove job position (Admin Only)
/**
 * POST: Delete several job positions at once (Admin Only).
 *
 * Applications already received are left alone — they are stored separately and
 * a closed position is not a reason to lose the people who applied to it.
 */
export const deleteManyJobs = async (req: Request, res: Response): Promise<any> => {
  try {
    const { ids } = req.body;

    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ success: false, message: "No positions selected" });
    }

    // An upper bound so one malformed request cannot wipe the list.
    if (ids.length > 200) {
      return res.status(400).json({
        success: false,
        message: "Please delete at most 200 positions at a time",
      });
    }

    const result = await Job.deleteMany({ _id: { $in: ids } });

    res.status(200).json({
      success: true,
      message: `${result.deletedCount} position(s) deleted successfully!`,
      deletedCount: result.deletedCount,
    });
  } catch (error) {
    console.error("Error deleting jobs:", error);
    res.status(500).json({ success: false, message: "Failed to delete the positions" });
  }
};

export const deleteJob = async (req: Request, res: Response): Promise<any> => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) {
      return res.status(404).json({ success: false, message: "Job position not found" });
    }

    await Job.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: "Job position deleted successfully!",
    });
  } catch (error) {
    console.error("Error deleting job:", error);
    res.status(500).json({ success: false, message: "Server error deleting job position" });
  }
};
