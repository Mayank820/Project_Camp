filtering, search and pagination for getUserTask controller
const getUserTasks = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 10,
    status,
    assignedTo,
    tag,
    search
  } = req.query;

  const filter = {
    $or: [
      { assignedTo: req.user._id },
      { assignedBy: req.user._id }
    ]
  };

  // Add filters if provided
  if (status) filter.status = status;
  if (assignedTo) filter.assignedTo = assignedTo;
  if (tag) filter.tags = tag; // assumes tags is an array
  if (search) {
    filter.title = { $regex: search, $options: "i" };
  }

  const skip = (parseInt(page) - 1) * parseInt(limit);

  const tasks = await Task.find(filter)
    .skip(skip)
    .limit(parseInt(limit))
    .sort({ createdAt: -1 })
    .populate("project assignedTo assignedBy", "name username fullname");

  const total = await Task.countDocuments(filter);

  return res.status(200).json(
    new ApiResponse(200, {
      tasks,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / limit)
      }
    })
  );
});


Step 2: Update getTasksByProject (optional)
 const getTasksByProject = asyncHandler(async (req, res) => {
  const { projectId } = req.params;
  const { status, page = 1, limit = 10 } = req.query;

  const isMember = await isMemberOfProject(req.user._id, projectId);
  if (!isMember) throw new ApiError(403, "Not a member of this project");

  const filter = { project: projectId };
  if (status) filter.status = status;

  const skip = (parseInt(page) - 1) * parseInt(limit);

  const tasks = await Task.find(filter)
    .skip(skip)
    .limit(parseInt(limit))
    .sort({ createdAt: -1 });

  const total = await Task.countDocuments(filter);

  return res.status(200).json(
    new ApiResponse(200, {
      tasks,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / limit)
      }
    })
  );
});

Step 3: Add tags Field to Task Model (if not already)
tags: {
  type: [String],
  default: []
}
