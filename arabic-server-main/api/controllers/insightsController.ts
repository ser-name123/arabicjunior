import { Request, Response } from "express";
import User from "../models/user";
import StudentRegistration from "../models/studentRegistration";

// Utility: normalize date to midnight
const normalizeDate = (date: Date) =>
    new Date(date.getFullYear(), date.getMonth(), date.getDate());

export const getEnrollmentTrends = async (req: Request, res: Response) => {
    try {
        const { timeRange, from, to } = req.query as {
            timeRange?: "7d" | "30d" | "90d";
            from?: string;
            to?: string;
        };

        // Date boundaries
        let startDate: Date;
        let endDate: Date = normalizeDate(new Date());

        if (from && to) {
            startDate = normalizeDate(new Date(from));
            endDate = normalizeDate(new Date(to));
        } else {
            const days = timeRange === "7d" ? 7 : timeRange === "30d" ? 30 : 90;
            startDate = new Date(endDate);
            startDate.setDate(endDate.getDate() - days);
        }

        // Aggregate Trial Bookings (User)
        const trialData = await User.aggregate([
            {
                $match: { createdAt: { $gte: startDate, $lte: endDate } },
            },
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                    trial: { $sum: 1 },
                },
            },
            { $sort: { _id: 1 } },
        ]);

        // Aggregate Registrations (StudentRegistration)
        const regData = await StudentRegistration.aggregate([
            {
                $match: { createdAt: { $gte: startDate, $lte: endDate } },
            },
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                    registered: { $sum: 1 },
                },
            },
            { $sort: { _id: 1 } },
        ]);

        // Merge results by date
        const trendsMap: Record<
            string,
            { date: string; trial: number; registered: number }
        > = {};

        trialData.forEach((d) => {
            trendsMap[d._id] = { date: d._id, trial: d.trial, registered: 0 };
        });

        regData.forEach((d) => {
            if (!trendsMap[d._id]) {
                trendsMap[d._id] = { date: d._id, trial: 0, registered: d.registered };
            } else {
                trendsMap[d._id].registered = d.registered;
            }
        });

        const merged = Object.values(trendsMap);

        res.status(200).json({ data: merged });
    } catch (error) {
        console.error("getEnrollmentTrends Error:", error);
        res.status(500).json({ message: "Failed to fetch enrollment trends" });
    }
};

export const getConversionFunnel = async (req: Request, res: Response) => {
    try {
        const { timeRange, from, to } = req.query as {
            timeRange?: "7d" | "30d" | "90d";
            from?: string;
            to?: string;
        };

        // Determine date boundaries
        let startDate: Date;
        let endDate: Date = normalizeDate(new Date());

        if (from && to) {
            startDate = normalizeDate(new Date(from));
            endDate = normalizeDate(new Date(to));
        } else {
            const days = timeRange === "7d" ? 7 : timeRange === "30d" ? 30 : 90;
            startDate = new Date(endDate);
            startDate.setDate(endDate.getDate() - days);
        }

        // === 1. Trial Booked ===
        const trialBooked = await User.countDocuments({
            createdAt: { $gte: startDate, $lte: endDate },
        });

        // === 2. Trial Attended (assuming field: attended: true in User) ===
        const trialAttended = await User.countDocuments({
            createdAt: { $gte: startDate, $lte: endDate },
            attended: true, // <-- adjust based on schema
        });

        // === 3. Registered ===
        const registered = await StudentRegistration.countDocuments({
            createdAt: { $gte: startDate, $lte: endDate },
        });

        const funnelData = [
            { stage: "trialBooked", value: trialBooked },
            { stage: "trialAttended", value: trialAttended },
            { stage: "registered", value: registered },
        ]

        const conversionRate = trialBooked > 0
            ? Number(((registered / trialBooked) * 100).toFixed(2))
            : 0;

        res.status(200).json({
            data: funnelData,
            conversionRate
        });
    } catch (error) {
        console.error("getConversionFunnel Error:", error);
        res.status(500).json({ message: "Failed to fetch conversion funnel data" });
    }
};

export const getTeacherGenderPreference = async (req: Request, res: Response) => {
    try {
        // Aggregate counts by preferredTeacher
        const result = await User.aggregate([
            {
                $group: {
                    _id: "$preferredTeacher",
                    count: { $sum: 1 },
                },
            },
            {
                $project: {
                    _id: 0,
                    gender: "$_id",
                    count: 1,
                },
            },
        ]);

        // Ensure all three categories are included
        const defaults = ["Male", "Female", "Other"];
        const mapped: Record<string, number> = {};

        result.forEach((item) => {
            mapped[item.gender] = item.count;
        });

        const finalData = defaults.map((gender) => ({
            gender,
            count: mapped[gender] || 0,
        }));

        res.status(200).json({
            data: finalData,
        });
    } catch (error) {
        console.error("getTeacherGenderPreference Error:", error);
        res.status(500).json({ message: "Failed to fetch teacher gender preference data" });
    }
};

export const getHowFindUs = async (req: Request, res: Response) => {
    try {
        // Group by "howFindUs" field and count
        const result = await User.aggregate([
            {
                $group: {
                    _id: { $ifNull: ["$howFindUs", "Unknown"] }, // handle null/undefined
                    count: { $sum: 1 }
                }
            },
            {
                $project: {
                    _id: 0,
                    source: "$_id",
                    count: 1
                }
            },
            { $sort: { count: -1 } }, // sort descending
            { $limit: 5 }             // only top 5
        ]);

        res.status(200).json({
            data: result
        });
    } catch (error) {
        console.error("getHowFindUs Error:", error);
        res.status(500).json({ message: "Failed to fetch How Did You Find Us data" });
    }
};

export const getCityWiseStudents = async (req: Request, res: Response) => {
    try {
        const result = await User.aggregate([
            {
                $group: {
                    _id: { $ifNull: ["$userIP", "Unknown"] }, // group by userIp (city name or fallback)
                    count: { $sum: 1 },
                },
            },
            {
                $project: {
                    _id: 0,
                    city: "$_id",
                    count: 1,
                },
            },
            { $sort: { count: -1 } }, // sort by highest students
            { $limit: 5 }             // only top 5 cities
        ]);

        res.status(200).json({
            data: result
        });
    } catch (error) {
        console.error("getCityWiseStudents Error:", error);
        res.status(500).json({ message: "Failed to fetch city wise students data" });
    }
};

export const getTop5Grades = async (req: Request, res: Response) => {
    try {
        const result = await StudentRegistration.aggregate([
            {
                $group: {
                    _id: "$class_grade", // group by class_grade (1–12)
                    count: { $sum: 1 },  // count students
                },
            },
            { $sort: { count: -1 } }, // highest count first
            { $limit: 5 }, // only top 5 grades
            {
                $project: {
                    _id: 0,
                    grade: "$_id",
                    count: 1,
                },
            },
        ]);

        res.status(200).json({
            success: true,
            data: result,
        });
    } catch (error) {
        console.error("getTop5Grades Error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch top 5 grades data",
        });
    }
};

export const getTop5Curriculams = async (req: Request, res: Response) => {
    try {
        const result = await StudentRegistration.aggregate([
            {
                $group: {
                    _id: "$curriculum",
                    count: { $sum: 1 },
                },
            },
            { $sort: { count: -1 } },
            { $limit: 5 },
            {
                $project: {
                    _id: 0,
                    curriculum: "$_id",
                    count: 1,
                },
            },
        ]);

        res.status(200).json({
            success: true,
            data: result,
        });
    } catch (err) {
        console.error("Error fetching top curriculums:", err);
        res.status(500).json({ error: "Internal server error" });
    }
}

export const getTopPreferredTimes = async (req: Request, res: Response) => {
    try {
        const result = await StudentRegistration.aggregate([
            {
                $group: {
                    _id: "$preferred_time",
                    count: { $sum: 1 },
                },
            },
            { $sort: { count: -1 } },
            { $limit: 5 },
            {
                $project: {
                    _id: 0,
                    preferred_time: "$_id",
                    count: 1,
                },
            },
        ]);

        res.status(200).json({
            success: true,
            data: result,
        });
    } catch (err) {
        console.error("Error fetching top preferred times:", err);
        res.status(500).json({ error: "Internal server error" });
    }
}

export const getDashboardTile = async (req: Request, res: Response) => {
    try {
        // Trial students (attended)
        const trialTotal = await User.countDocuments();
        const trialMale = await User.countDocuments({ gender: "male" });
        const trialFemale = await User.countDocuments({ gender: "female" });

        // Registered students (attended)
        const registeredTotal = await StudentRegistration.countDocuments();
        const registeredMale = await StudentRegistration.countDocuments({ gender: "male" });
        const registeredFemale = await StudentRegistration.countDocuments({ gender: "female" });

        // Pending trial students (signed up but not attended)
        const pendingTrialTotal = await User.countDocuments({ attended: false });
        const pendingTrialMale = await User.countDocuments({ gender: "male", attended: false });
        const pendingTrialFemale = await User.countDocuments({ gender: "female", attended: false });

        // Conversion rate (only attended trials vs attended registrations)
        const conversionRate =
            trialTotal > 0 ? ((registeredTotal / trialTotal) * 100).toFixed(1) + "%" : "0%";

        res.json({
            trialStudents: {
                total: trialTotal,
                male: trialMale,
                female: trialFemale,
            },
            registeredStudents: {
                total: registeredTotal,
                male: registeredMale,
                female: registeredFemale,
            },
            pendingTrialStudents: {
                total: pendingTrialTotal,
                male: pendingTrialMale,
                female: pendingTrialFemale,
            },
            conversionRate: {
                total: conversionRate,
                male:
                    trialMale > 0
                        ? ((registeredMale / trialMale) * 100).toFixed(1) + "%"
                        : "0%",
                female:
                    trialFemale > 0
                        ? ((registeredFemale / trialFemale) * 100).toFixed(1) + "%"
                        : "0%",
            },
        });
    } catch (err) {
        console.error("Error fetching dashboard tiles:", err);
        res.status(500).json({ message: "Server error" });
    }
};
