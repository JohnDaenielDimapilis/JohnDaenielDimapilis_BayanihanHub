export const sampleUsers = [
  {
    _id: "user-1",
    fullName: "John Daeniel Dimapilis",
    email: "john@example.com",
    role: "admin",
    status: "active",
    createdAt: "2026-04-30"
  },
  {
    _id: "user-2",
    fullName: "Foundation Staff",
    email: "staff@example.com",
    role: "staff",
    status: "active",
    createdAt: "2026-05-02"
  },
  {
    _id: "user-3",
    fullName: "Volunteer Donor",
    email: "volunteer@example.com",
    role: "user",
    status: "active",
    createdAt: "2026-05-03"
  }
];

export const sampleEvents = [
  {
    _id: "event-1",
    eventTitle: "Community Health Outreach",
    description: "Medical mission and wellness education for families in partner barangays.",
    location: "San Jose Covered Court",
    eventDate: "2026-06-18",
    capacity: 120,
    status: "approved",
    participants: sampleUsers.slice(1)
  },
  {
    _id: "event-2",
    eventTitle: "Youth Literacy Workshop",
    description: "Volunteer-led reading sessions and school supply distribution.",
    location: "Bayanihan Learning Center",
    eventDate: "2026-07-04",
    capacity: 80,
    status: "pending",
    participants: [sampleUsers[2]]
  },
  {
    _id: "event-3",
    eventTitle: "Disaster Preparedness Drive",
    description: "Training and relief pack preparation for emergency response volunteers.",
    location: "Foundation Hall",
    eventDate: "2026-07-22",
    capacity: 150,
    status: "approved",
    participants: []
  }
];

export const sampleFundraisers = [
  {
    _id: "fund-1",
    campaignTitle: "School Kit Sponsorship",
    description: "Funding notebooks, bags, hygiene kits, and learning supplies for students.",
    targetAmount: 150000,
    currentAmount: 84500,
    startDate: "2026-05-01",
    endDate: "2026-08-30",
    status: "approved"
  },
  {
    _id: "fund-2",
    campaignTitle: "Community Pantry Support",
    description: "Sustaining food packs and essentials for low-income households.",
    targetAmount: 95000,
    currentAmount: 25000,
    startDate: "2026-05-15",
    endDate: "2026-07-15",
    status: "pending"
  }
];

export const sampleDonations = [
  {
    _id: "donation-1",
    fundraiserId: sampleFundraisers[0],
    donationAmount: 2500,
    paymentMethod: "gcash",
    donationStatus: "completed",
    createdAt: "2026-05-05"
  },
  {
    _id: "donation-2",
    fundraiserId: sampleFundraisers[0],
    donationAmount: 5000,
    paymentMethod: "bank_transfer",
    donationStatus: "completed",
    createdAt: "2026-05-07"
  }
];

export const sampleFeedback = [
  {
    _id: "feedback-1",
    userId: sampleUsers[2],
    eventId: sampleEvents[0],
    rating: 5,
    comment: "Organized, welcoming, and meaningful for volunteers.",
    createdAt: "2026-05-08"
  },
  {
    _id: "feedback-2",
    userId: sampleUsers[1],
    eventId: sampleEvents[2],
    rating: 4,
    comment: "Helpful process, with room to improve queue coordination.",
    createdAt: "2026-05-09"
  }
];

export const sampleAchievements = [
  {
    _id: "achievement-1",
    achievementTitle: "First Outreach Volunteer",
    description: "Joined the first approved BayanihanHub foundation event.",
    achievementType: "volunteer",
    earnedDate: "2026-05-08"
  },
  {
    _id: "achievement-2",
    achievementTitle: "Community Donor",
    description: "Completed a donation to an approved fundraiser.",
    achievementType: "donor",
    earnedDate: "2026-05-09"
  }
];

export const sampleLogs = [
  {
    _id: "log-1",
    activityType: "approval_event_approved",
    description: "Admin approved Community Health Outreach.",
    ipAddress: "127.0.0.1",
    createdAt: "2026-05-06"
  },
  {
    _id: "log-2",
    activityType: "security_login_failed",
    description: "Failed login attempt for unknown@example.com.",
    ipAddress: "127.0.0.1",
    createdAt: "2026-05-07"
  }
];

export const sampleSummary = {
  totalEvents: 3,
  pendingEvents: 1,
  approvedFundraisers: 1,
  totalDonations: 92500,
  registeredUsers: 3,
  activeParticipants: 3,
  recentLogs: sampleLogs,
  recentFeedback: sampleFeedback
};
