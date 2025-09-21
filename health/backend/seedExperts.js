import { Expert } from './models/Expert.js'; 

const seedExperts = [
  {
    name: "Dr. Brene Brown",
    title: "Research Professor & Vulnerability Expert",
    bio: "Research professor at the University of Houston, studying courage, vulnerability, shame, and empathy. Author of multiple bestselling books on emotional wellness.",
    profilePicture: "https://randomuser.me/api/portraits/women/32.jpg",
    specializations: ["Wellness", "Therapy"],
    credentials: ["PhD", "LMSW"],
    verified: true,
    followersCount: 125000,
    posts: [
      {
        title: "The Power of Vulnerability",
        content: "Vulnerability is not weakness; it's our greatest measure of courage. When we dare to show up and be seen, we create space for connection and growth.",
        image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=600&h=400&fit=crop",
        category: "Wellness",
        likes: 2340
      },
      {
        title: "Shame Resilience",
        content: "Shame thrives on secrecy, silence, and judgment. The antidote? Empathy, vulnerability, and reaching out. You are not alone in your struggles.",
        image: "https://images.unsplash.com/photo-1544027993-37dbfe43562a?w=600&h=400&fit=crop",
        category: "Therapy",
        likes: 1890
      },
      {
        title: "Daring Leadership",
        content: "We need leaders who are willing to show up, be vulnerable, and create brave spaces where people can bring their whole selves to work.",
        image: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=600&h=400&fit=crop",
        category: "Wellness",
        likes: 1567
      }
    ]
  },
  {
    name: "Dr. Daniel Siegel",
    title: "Clinical Professor of Psychiatry",
    bio: "Clinical professor of psychiatry at UCLA School of Medicine and executive director of the Mindsight Institute. Pioneer in the field of interpersonal neurobiology.",
    profilePicture: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=400&h=400&fit=crop&crop=face",
    specializations: ["Therapy", "Anxiety"],
    credentials: ["MBBS"],
    verified: true,
    followersCount: 71000,
    posts: [
      {
        title: "The Happiness Trap",
        content: "The harder we chase happiness, the more elusive it becomes. True fulfillment comes from living according to your values, not from feeling good all the time.",
        image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=600&h=400&fit=crop",
        category: "Therapy",
        likes: 2123
      },
      {
        title: "ACT: Psychological Flexibility",
        content: "Psychological flexibility is the ability to stay present and take action guided by your values, even when experiencing difficult thoughts and emotions.",
        image: "https://images.unsplash.com/photo-1544027993-37dbfe43562a?w=600&h=400&fit=crop",
        category: "Anxiety",
        likes: 1765
      },
      {
        title: "Defusion Techniques",
        content: "You are not your thoughts. When difficult thoughts arise, try saying 'I'm having the thought that...' to create distance and reduce their impact.",
        image: "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=600&h=400&fit=crop",
        category: "Therapy",
        likes: 1543
      }
    ]
  },
  {
    name: "Dr. Kristin Neff",
    title: "Self-Compassion Pioneer",
    bio: "Associate professor at University of Texas and leading researcher in self-compassion. Co-developer of Mindful Self-Compassion program.",
    profilePicture: "https://images.unsplash.com/photo-1551836022-deb4988cc6c0?w=400&h=400&fit=crop&crop=face",
    specializations: ["Mindfulness", "Depression"],
    credentials: ["PhD"],
    verified: true,
    followersCount: 96000,
    posts: [
      {
        title: "Self-Compassion Break",
        content: "When you're struggling, try the self-compassion break: 1) Acknowledge 'This is a moment of suffering', 2) Remember 'Suffering is part of life', 3) Offer yourself kindness.",
        image: "https://images.unsplash.com/photo-1518611012118-696072aa579a?w=600&h=400&fit=crop",
        category: "Mindfulness",
        likes: 2876
      },
      {
        title: "Common Humanity",
        content: "When we feel isolated in our pain, remember that all humans suffer. Your struggles connect you to the universal human experience, not separate you from it.",
        image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600&h=400&fit=crop",
        category: "Depression",
        likes: 2134
      }
    ]
  },
  // … (All other existing experts you had in the second half of your array, including Dr. Gabor Maté, Dr. Tara Brach, Dr. Susan David, Dr. Bessel van der Kolk, Dr. Judson Brewer, Dr. Kelly McGonigal, Dr. Christopher Germer, Dr. Shauna Shapiro, Dr. Marsha Linehan, Dr. Dan Harris, etc.)
  // New 5 experts continuation
  {
    name: "Dr. Russ Harris",
    title: "ACT Therapist & Author",
    bio: "Medical practitioner, psychotherapist, and trainer in Acceptance and Commitment Therapy (ACT). Author of 'The Happiness Trap' and ACT expert.",
    profilePicture: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=400&h=400&fit=crop&crop=face",
    specializations: ["Therapy", "Wellness"],
    credentials: ["MD", "PhD"],
    verified: true,
    followersCount: 83000,
    posts: [
      {
        title: "Acceptance and Commitment",
        content: "Learning to accept your thoughts and feelings while committing to values-driven actions is the core of ACT.",
        image: "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=600&h=400&fit=crop",
        category: "Therapy",
        likes: 1987
      },
      {
        title: "Defusion Techniques",
        content: "Distance yourself from your thoughts by labeling them as 'just thoughts' to reduce their emotional impact.",
        image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=600&h=400&fit=crop",
        category: "Wellness",
        likes: 1654
      }
    ]
  },
  {
    name: "Dr. Rick Hanson",
    title: "Neuropsychologist & Author",
    bio: "Neuropsychologist focusing on the brain's potential for happiness, love, and wisdom. Author of 'Hardwiring Happiness'.",
    profilePicture: "https://images.unsplash.com/photo-1502764613149-7f1d229e230f?w=400&h=400&fit=crop&crop=face",
    specializations: ["Mindfulness", "Wellness"],
    credentials: ["PhD"],
    verified: true,
    followersCount: 91000,
    posts: [
      {
        title: "Hardwiring Happiness",
        content: "Positive experiences can change the structure of your brain if you internalize them. Practice noticing and savoring good moments.",
        image: "https://images.unsplash.com/photo-1518611012118-696072aa579a?w=600&h=400&fit=crop",
        category: "Mindfulness",
        likes: 2345
      },
      {
        title: "Taking in the Good",
        content: "Consciously absorbing positive experiences strengthens neural pathways for well-being and resilience.",
        image: "https://images.unsplash.com/photo-1528319725582-ddc096101511?w=600&h=400&fit=crop",
        category: "Wellness",
        likes: 1987
      }
    ]
  },
  {
    name: "Dr. Elisha Goldstein",
    title: "Mindfulness-Based Psychologist",
    bio: "Clinical psychologist and mindfulness teacher helping people reduce stress, improve focus, and increase emotional balance.",
    profilePicture: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=400&fit=crop&crop=face",
    specializations: ["Mindfulness", "Anxiety"],
    credentials: ["PhD"],
    verified: true,
    followersCount: 64000,
    posts: [
      {
        title: "Mindfulness for Anxiety",
        content: "Mindfulness helps break cycles of worry and rumination by bringing your attention to the present moment.",
        image: "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=600&h=400&fit=crop",
        category: "Anxiety",
        likes: 1765
      },
      {
        title: "Daily Mindfulness Practice",
        content: "Even five minutes of daily mindfulness can help you become more aware, calm, and resilient.",
        image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=600&h=400&fit=crop",
        category: "Mindfulness",
        likes: 1543
      }
    ]
  },
  {
    name: "Dr. Joan Borysenko",
    title: "Mind-Body Medicine Expert",
    bio: "Pioneer in mind-body medicine and stress reduction. Author of multiple books on resilience, spirituality, and healing.",
    profilePicture: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face",
    specializations: ["Wellness", "Therapy"],
    credentials: ["PhD"],
    verified: true,
    followersCount: 58000,
    posts: [
      {
        title: "Stress Reduction Techniques",
        content: "Breathing, visualization, and mindfulness can reduce stress and improve overall well-being.",
        image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&h=400&fit=crop",
        category: "Wellness",
        likes: 1456
      },
      {
        title: "Healing Through Awareness",
        content: "Becoming aware of your thoughts and emotions allows you to intervene and make conscious choices for health and growth.",
        image: "https://images.unsplash.com/photo-1528319725582-ddc096101511?w=600&h=400&fit=crop",
        category: "Therapy",
        likes: 1324
      }
    ]
  },
  {
    name: "Dr. Sheryl Paul",
    title: "Self-Compassion & Life Coach",
    bio: "Author, speaker, and coach focused on self-compassion, resilience, and conscious living.",
    profilePicture: "https://randomuser.me/api/portraits/women/33.jpg",
    specializations: ["Wellness", "Mindfulness"],
    credentials: ["MSc"],
    verified: true,
    followersCount: 47000,
    posts: [
      {
        title: "Embracing Imperfection",
        content: "Accepting your imperfections with compassion is key to living a balanced, joyful life.",
        image: "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=600&h=400&fit=crop",
        category: "Wellness",
        likes: 1432
      },
      {
        title: "Living Mindfully",
        content: "Bring awareness to everyday moments and choose how to respond rather than react impulsively.",
        image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=600&h=400&fit=crop",
        category: "Mindfulness",
        likes: 1298
      }
    ]
  }
];
export const seedDatabase = async () => {
  try {
    await Expert.deleteMany({});
    console.log('Cleared existing experts');

    const expertsWithPostCount = seedExperts.map(expert => ({
      ...expert,
      postsCount: expert.posts.length
    }));

    const inserted = await Expert.insertMany(expertsWithPostCount);
    console.log(`Inserted ${inserted.length} experts`);
    return inserted;
  } catch (error) {
    console.error('Error seeding database:', error);
    throw error;
  }
};