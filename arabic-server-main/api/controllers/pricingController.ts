import { Request, Response } from "express";
import {
  PricingGroup,
  PricingPlan,
  ACCENT_COLORS,
  IPricingGroup,
  IPricingPlan,
  IPlanFeature,
} from "../models/pricing";

/**
 * Bodies here are JSON, not multipart — pricing has no uploads — so values
 * arrive already typed.
 */

const asTrimmed = (value: unknown): string | undefined =>
  typeof value === "string" && value.trim() ? value.trim() : undefined;

const asStringArray = (value: unknown): string[] | undefined => {
  if (!Array.isArray(value)) return undefined;
  return value
    .map((v) => (typeof v === "string" ? v.trim() : ""))
    .filter((v) => v.length > 0);
};

/**
 * A relative path or an http(s) URL. Anything else — javascript:, data: — must
 * never reach an anchor href.
 */
const isSafeUrl = (value: string) => {
  if (value.startsWith("/")) return true;
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:";
  } catch {
    return false;
  }
};

// ---------------------------------------------------------------------------
// Public
// ---------------------------------------------------------------------------

/**
 * Returns the page ready to render: published groups in order, each with its
 * published plans nested. One request instead of one per tab.
 */
export const getPublishedPricing = async (_req: Request, res: Response) => {
  try {
    const groups = await PricingGroup.find({ status: "published" })
      .sort({ order: 1 })
      .select("-__v")
      .lean();

    const plans = await PricingPlan.find({ status: "published" })
      .sort({ order: 1 })
      .select("-__v")
      .lean();

    const data = groups.map((group) => ({
      ...group,
      plans: plans.filter((plan) => plan.groupKey === group.key),
    }));

    res.status(200).json({ success: true, message: "success", data });
  } catch (error: any) {
    console.error("Error listing pricing:", error);
    res.status(500).json({ success: false, message: "Could not load pricing" });
  }
};

// ---------------------------------------------------------------------------
// Admin — groups
// ---------------------------------------------------------------------------

export const getPricingGroups = async (_req: Request, res: Response) => {
  try {
    const groups = await PricingGroup.find().sort({ order: 1 });
    res.status(200).json({
      success: true,
      message: "success",
      data: groups,
      // The list is small and never paginated, but the shared DataTable
      // expects this shape.
      pagination: { total: groups.length, page: 1, limit: groups.length || 1, totalPages: 1 },
    });
  } catch (error: any) {
    console.error("Error listing pricing groups:", error);
    res.status(500).json({ success: false, message: "Could not load pricing tabs" });
  }
};

export const getPricingGroupById = async (req: Request, res: Response): Promise<any> => {
  try {
    const group = await PricingGroup.findById(req.params.id);
    if (!group) return res.status(404).json({ success: false, message: "Pricing tab not found" });
    res.status(200).json({ success: true, data: group });
  } catch {
    res.status(400).json({ success: false, message: "Invalid id" });
  }
};

const buildGroupFields = (
  body: Record<string, unknown>,
  existing?: IPricingGroup
): { error: string } | { fields: Partial<IPricingGroup> } => {
  const fields: Partial<IPricingGroup> = {};

  const label = asTrimmed(body.label) ?? existing?.label;
  if (!label) return { error: "Tab name is required" };
  fields.label = label;

  // Derived from the label on create so the admin never has to think about
  // slugs; frozen afterwards because the plans reference it.
  if (!existing) {
    const key =
      asTrimmed(body.key)?.toLowerCase() ??
      label.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
    if (!key) return { error: "Could not build a key from that tab name" };
    fields.key = key;
  }

  const notes = asStringArray(body.notes);
  if (notes !== undefined) fields.notes = notes;
  else if (!existing) fields.notes = [];

  const status = asTrimmed(body.status) ?? existing?.status ?? "draft";
  if (status !== "draft" && status !== "published") {
    return { error: "Status must be either 'draft' or 'published'" };
  }
  fields.status = status;

  const order = Number(body.order ?? existing?.order ?? 0);
  if (!Number.isFinite(order)) return { error: "Order must be a number" };
  fields.order = order;

  return { fields };
};

export const createPricingGroup = async (req: Request, res: Response): Promise<any> => {
  try {
    const result = buildGroupFields(req.body as Record<string, unknown>);
    if ("error" in result) {
      return res.status(400).json({ success: false, message: result.error });
    }

    const clash = await PricingGroup.exists({ key: result.fields.key });
    if (clash) {
      return res
        .status(400)
        .json({ success: false, message: "A pricing tab with that name already exists" });
    }

    const group = await PricingGroup.create(result.fields);
    res.status(201).json({ success: true, data: group });
  } catch (error: any) {
    console.error("Error creating pricing group:", error);
    res.status(400).json({ success: false, message: error.message });
  }
};

export const updatePricingGroup = async (req: Request, res: Response): Promise<any> => {
  try {
    const existing = await PricingGroup.findById(req.params.id);
    if (!existing) {
      return res.status(404).json({ success: false, message: "Pricing tab not found" });
    }

    const result = buildGroupFields(req.body as Record<string, unknown>, existing);
    if ("error" in result) {
      return res.status(400).json({ success: false, message: result.error });
    }

    existing.set(result.fields);
    await existing.save();
    res.status(200).json({ success: true, data: existing });
  } catch (error: any) {
    console.error("Error updating pricing group:", error);
    res.status(400).json({ success: false, message: error.message });
  }
};

export const deletePricingGroup = async (req: Request, res: Response): Promise<any> => {
  try {
    const group = await PricingGroup.findById(req.params.id);
    if (!group) {
      return res.status(404).json({ success: false, message: "Pricing tab not found" });
    }

    // Deleting the tab would leave its cards unreachable — they would vanish
    // from the site while still sitting in the database. Say so instead.
    const planCount = await PricingPlan.countDocuments({ groupKey: group.key });
    if (planCount > 0) {
      return res.status(400).json({
        success: false,
        message: `This tab still has ${planCount} plan${planCount === 1 ? "" : "s"}. Delete or move them first.`,
      });
    }

    await group.deleteOne();
    res.status(200).json({ success: true, message: "Pricing tab deleted successfully" });
  } catch (error: any) {
    console.error("Error deleting pricing group:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ---------------------------------------------------------------------------
// Admin — plans
// ---------------------------------------------------------------------------

export const getPricingPlans = async (req: Request, res: Response) => {
  try {
    const { page = "1", limit = "20" } = req.query;
    const pageNumber = parseInt(page as string, 10) || 1;
    const pageSize = parseInt(limit as string, 10) || 20;

    const total = await PricingPlan.countDocuments();
    const plans = await PricingPlan.find()
      .sort({ groupKey: 1, order: 1 })
      .skip((pageNumber - 1) * pageSize)
      .limit(pageSize);

    res.status(200).json({
      success: true,
      message: "success",
      data: plans,
      pagination: {
        total,
        page: pageNumber,
        limit: pageSize,
        totalPages: Math.ceil(total / pageSize) || 1,
      },
    });
  } catch (error: any) {
    console.error("Error listing pricing plans:", error);
    res.status(500).json({ success: false, message: "Could not load plans" });
  }
};

export const getPricingPlanById = async (req: Request, res: Response): Promise<any> => {
  try {
    const plan = await PricingPlan.findById(req.params.id);
    if (!plan) return res.status(404).json({ success: false, message: "Plan not found" });
    res.status(200).json({ success: true, data: plan });
  } catch {
    res.status(400).json({ success: false, message: "Invalid id" });
  }
};

const buildPlanFields = async (
  body: Record<string, unknown>,
  existing?: IPricingPlan
): Promise<{ error: string } | { fields: Partial<IPricingPlan> }> => {
  const fields: Partial<IPricingPlan> = {};

  const groupKey = (asTrimmed(body.groupKey) ?? existing?.groupKey)?.toLowerCase();
  if (!groupKey) return { error: "Please choose which tab this plan belongs to" };

  // A plan pointing at a tab that does not exist would never render.
  const groupExists = await PricingGroup.exists({ key: groupKey });
  if (!groupExists) return { error: `There is no pricing tab with the key "${groupKey}"` };
  fields.groupKey = groupKey;

  const title = asTrimmed(body.title) ?? existing?.title;
  if (!title) return { error: "Plan name is required" };
  fields.title = title;

  const price = Number(body.price ?? existing?.price);
  if (!Number.isFinite(price) || price < 0) {
    return { error: "Price must be a number of 0 or more" };
  }
  fields.price = price;

  fields.currency = asTrimmed(body.currency) ?? existing?.currency ?? "AED";

  const accentColor = asTrimmed(body.accentColor) ?? existing?.accentColor ?? "yellow";
  if (!ACCENT_COLORS.includes(accentColor as never)) {
    return { error: `Colour must be one of: ${ACCENT_COLORS.join(", ")}` };
  }
  fields.accentColor = accentColor as IPricingPlan["accentColor"];

  if (body.features !== undefined) {
    if (!Array.isArray(body.features)) return { error: "Features must be a list" };

    const features: IPlanFeature[] = [];
    for (const raw of body.features) {
      if (!raw || typeof raw !== "object") continue;
      const entry = raw as Record<string, unknown>;
      const featureTitle = asTrimmed(entry.title);
      if (!featureTitle) continue;
      features.push({ title: featureTitle, included: entry.included !== false });
    }
    if (features.length === 0) return { error: "Add at least one feature line" };
    fields.features = features;
  } else if (!existing) {
    return { error: "Add at least one feature line" };
  }

  fields.actionLabel = asTrimmed(body.actionLabel) ?? existing?.actionLabel ?? "Lets start";

  const actionUrl = asTrimmed(body.actionUrl) ?? existing?.actionUrl ?? "/register";
  if (!isSafeUrl(actionUrl)) {
    return { error: "Button link must start with / or be a full http(s) address" };
  }
  fields.actionUrl = actionUrl;

  const status = asTrimmed(body.status) ?? existing?.status ?? "draft";
  if (status !== "draft" && status !== "published") {
    return { error: "Status must be either 'draft' or 'published'" };
  }
  fields.status = status;

  const order = Number(body.order ?? existing?.order ?? 0);
  if (!Number.isFinite(order)) return { error: "Order must be a number" };
  fields.order = order;

  return { fields };
};

export const createPricingPlan = async (req: Request, res: Response): Promise<any> => {
  try {
    const result = await buildPlanFields(req.body as Record<string, unknown>);
    if ("error" in result) {
      return res.status(400).json({ success: false, message: result.error });
    }

    const plan = await PricingPlan.create(result.fields);
    res.status(201).json({ success: true, data: plan });
  } catch (error: any) {
    console.error("Error creating pricing plan:", error);
    res.status(400).json({ success: false, message: error.message });
  }
};

export const updatePricingPlan = async (req: Request, res: Response): Promise<any> => {
  try {
    const existing = await PricingPlan.findById(req.params.id);
    if (!existing) return res.status(404).json({ success: false, message: "Plan not found" });

    const result = await buildPlanFields(req.body as Record<string, unknown>, existing);
    if ("error" in result) {
      return res.status(400).json({ success: false, message: result.error });
    }

    existing.set(result.fields);
    await existing.save();
    res.status(200).json({ success: true, data: existing });
  } catch (error: any) {
    console.error("Error updating pricing plan:", error);
    res.status(400).json({ success: false, message: error.message });
  }
};

export const deletePricingPlan = async (req: Request, res: Response): Promise<any> => {
  try {
    const plan = await PricingPlan.findById(req.params.id);
    if (!plan) return res.status(404).json({ success: false, message: "Plan not found" });

    await plan.deleteOne();
    res.status(200).json({ success: true, message: "Plan deleted successfully" });
  } catch (error: any) {
    console.error("Error deleting pricing plan:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};
