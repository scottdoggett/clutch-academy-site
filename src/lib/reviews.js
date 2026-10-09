// Every Google review with words in it, copied from the profile on October 9,
// 2026: 43 of the 44 (WAMBUI, Henrey left five stars and no text). Verbatim,
// typos and all, under the name the profile shows (but "Obiora Ejiofor",
// capitalised as the package pages have it); only the curly apostrophes
// are straight. When a new review lands, add it here; the
// site-wide rating/count numbers live in src/lib/googleReviews.js.
//
// A long review is cut after a whole sentence, so no quote runs past about
// 290 characters (Ryan Bergman's, the longest whole one). Every card in the
// strip is as tall as the longest quote needs, so one long review would
// make all of them taller. `stars` is there only where a review isn't five.
// Matthew Hartford's four-star review stops before its second paragraph,
// which suggests "a 'learning driver' sign and getting an emergency break
// installed": whether that belongs on the homepage is Sam's call.
//
// Read by the homepage's moving strip (src/components/ReviewsMarquee.jsx).
// Every card is as wide as its quote needs, at one shared height, so a long
// quote makes a wide card. The first one, the only card a phone shows at
// first, should still be a full one; the shortest quotes sit further in,
// between longer ones.
export const REVIEWS = [
  {
    quote:
      "Honestly one of the best driving instructors out there if you want to learn manual. Super patient, explains everything in a way that actually makes sense, and makes you feel comfortable even if you're nervous or completely new to stick shift.",
    name: 'Anthony Mannella',
  },
  {
    quote:
      "Sam made learning to drive a manual much easier and more enjoyable! He's patient, friendly, and a great teacher. Highly recommend to anyone!",
    name: 'Fearghus MacDonald',
  },
  {
    quote:
      "I signed up with zero prior experience and after a few lessons with Sam, I feel extremely confident driving manual. Sam, I can't thank you enough - your patience, professionalism, and complete knowledge of the craft put me at ease right away and it was a pleasure learning from you!",
    name: 'Evan',
  },
  {
    quote:
      'I had the best time learning how to drive manual with Sam. He has great customer service and wonderful tips for driving with a stick. Thank you Clutch team !!!',
    name: 'Dakota Abell',
  },
  {
    quote:
      'Came to clutchacademy to learn manual before moving to Germany. Sam is very patient and very knowledgeable. He made me feel comfortable and explained things in a way a beginner with no prior knowledge could understand. By the 2nd lesson i was already on the main road!',
    name: 'Raeven Chase',
  },
  {
    quote:
      'Had such a positive experience! Very professional, calm, and efficient. Would definitely recommend!',
    name: 'Hannah Bance',
  },
  {
    quote:
      'I had a great experience learning how to drive manual with Sam. Not only was he patient and gave clear instructions, but his presence and attitude were very grounding and calming.',
    name: 'Laurence Butet-Roch',
  },
  {
    quote:
      "Sam is an incredible and clear instructor. I just moved to the city and learning manual in Toronto was an intimidating task but he made it simple. I couldn't be more grateful!",
    name: 'Michael C',
  },
  {
    quote:
      'I signed up for the 3-class deal with no prior experience driving manual and so far Sam has been an amazing teacher! He explained the mechanics of the car so well and really opened my eyes to the fundamentals of driving a manual car. Could not recommend more!',
    name: 'Jose Figueroa',
  },
  {
    quote:
      'Sam is such a great teacher! Very kind, patient, and helpful. Highly recommend learning manual from him!',
    name: 'Ben Boudreau',
  },
  {
    quote:
      'Used to think driving manual was super stressful, pure anxiety, lots of stalling, but one lesson with Sam and no more stalling, looking forward to learning smooth downshifts and hill starts in lessons 2 and 3!',
    name: 'Obiora Ejiofor',
  },
  {
    quote:
      'Great experience with sam. Very patient, clear instructions, and had a great time! Would recommend',
    name: 'A.J. Sachdev',
  },
  {
    quote:
      'Sam is the best! I was comfortable driving on Toronto streets within the first 2 lessons. He explained everything super clearly and made it a really fun experience. He answered all the questions I had and stayed calm when I was struggling with reversing. I highly recommend booking a lesson!',
    name: 'Scott Doggett',
  },
  {
    quote:
      'Sam is an excellent teacher who showed patience and encouragement throughout every lesson. He is the best teacher I could have had to learn to drive a standard.',
    name: 'Kait',
  },
  {
    quote:
      'I definitely recommend people learn how to drive a manual with Sam. He is patient with his students and makes sure they understand what they should do in different situations. By my second lesson I have already built my confidence in driving a manual.',
    name: 'Hongze Qin',
  },
  {
    quote:
      'Excellent and professional service. Great communication, I am now confident driving a manual car!',
    name: 'Zachary Foran',
  },
  {
    quote:
      "Sam was fantastic throughout the whole process. He was patient with me on my first lesson and by the third, I feel ready to navigate in Europe driving standard. Can't recommend Clutch enough to anyone looking to learn standard",
    name: 'Erica Carnicelli',
  },
  {
    quote:
      'Nice Gentleman Sam with good knowledge. Patient with the student and clear instruction.',
    name: 'Matthew Hartford',
    stars: 4,
  },
  {
    quote:
      "Had a great experience learning with Sam at Clutch Academy. He's super patient and explains things in a way that actually makes sense. Learning manual felt way less intimidating than I expected, and I felt noticeably more confident even after one lesson. Definitely recommend.",
    name: 'Ramin Sariaslani',
  },
  {
    quote: 'Sam is an expert at manual driving - highly recommend',
    name: 'Sheel Dalal',
  },
  {
    quote:
      "Highly recommend booking with Sam at Clutch Academy if you're looking to learn how to drive manual. Before scheduling my first lesson I gave him a call and he talked me through the lesson pack options, meeting locations, and my goals.",
    name: 'Cameron Shepherd',
  },
  {
    quote:
      'Best experience with Sam! Incredibly knowledgeable, personable, and easy to learn from. Highly recommend',
    name: 'Ven Djukic',
  },
  {
    quote:
      "Sam is a fantastic driving instructor! Incredibly patient and calm under stress, he can boost up a driving student's confidence behind the wheel in just a few hours. Manual driving was an intimidating skill for me to learn, so it was great to have trusted support for my first time trying!",
    name: 'Ryan Bergman',
  },
  {
    quote: 'Such a kind, informational and educated young man!',
    name: 'Bailey Mabey',
  },
  {
    quote:
      'Clutch Academy taught me so many valuable lessons about driving. I was very skeptical at first but have always dreamed of being able to drive a car with a stick ever since I was a little kid.',
    name: 'Peter Kopf',
  },
  {
    quote:
      'Sam was a great instructor! Went in with no experience and he was very patient and thorough teaching me every step. 10/10 recommend',
    name: 'Connie Liu',
  },
  {
    quote:
      'I had the best experience learning how to drive manual, Sam was very friendly, patient, and knowledgeable. He explained everything very clearly, I really enjoyed the experience and the calm, positive attitude while learning! I would highly recommend these manual driving lessons!',
    name: 'Ellie McDonald',
  },
  {
    quote:
      'Amazing guy helped out with driving Manuel and was really patient with me and price was very reasonable and also was very flexible with my time',
    name: 'Daniel',
  },
  {
    quote:
      'Sam was an excellent instructor. I had a very positive experience and he was very thoughtful in his approach to teaching this skill. As well, he ensured that I stayed calm the entire time as I was not only new to driving standard but new to city driving as well.',
    name: 'TylerMcBrien',
  },
  {
    quote:
      'My experience with Clutch Academy was educational and enjoyable. I highly recommend Clutch Academy for anybody who wants to learn how to drive manual.',
    name: 'Drew Glazier',
  },
  {
    quote:
      'Highly recommend! Learning manual with Sam was super chill. He is patient, knowledgeable, and took me through it step by step. I feel so much better about driving stick in the city! Great experience overall and well worth it for anyone wanting to learn.',
    name: 'Sara Murrin',
  },
  {
    quote:
      "Sam is such a helpful and educational instructor. It's been a pleasure taking lessons with Clutch Academy, and I highly recommend it!",
    name: 'Cameron Jedemann',
  },
  {
    quote:
      "Do yourself a favour and book! Sam is such a patient, thorough and amazing instructor. Having 0 experience, Sam really gave me the confidence to understand the mechanics of manual driving and how to control the vehicle. Can't recommend his service enough!",
    name: 'Adam Mejias',
  },
  {
    quote:
      'Sam is an excellent teacher who is amazing at what he does. I am so glad I took this lesson before buying my manual car and will 100% be taking another one. Thanks again!',
    name: 'Samson Levy',
  },
  {
    quote:
      "Leaving this review from Greece! I've driven manual daily over 10 years ago, but I felt like I needed a tune up for my vacation. Compared to other services, the sign up process was hassle-free.",
    name: 'Justin Alejandro',
  },
  {
    quote:
      'Sam gave me the confidence to pull the trigger and buy my first car with a manual transmission, very knowledge and personable instructor!',
    name: 'Fluid Bix',
  },
  {
    quote:
      'I have never driven a manual car before taking a lesson with Sam. Even after 1 session, Sam quickly was able to teach me the basics and I was comfortable enough to go driving on my own without him. I would definitely recommend Sam teaching you to drive manual!',
    name: 'Cole Janostin',
  },
  {
    quote:
      "Sam was super patient and a great teacher throughout the lessons. I highly recommend clutch academy if you're wanting to learn how to drive a manual!",
    name: 'Mollie MacDonald',
  },
  {
    quote:
      'Learning to drive a standard with Sam was a low stress experience with a patient and knowledgable instructor. I highly recommend Clutch Academy for anyone wanting to master the stick.',
    name: 'Tahnee Anthony',
  },
  {
    quote:
      'Great experience learning manual here. Clear instruction, patient teaching, and I felt confident behind the wheel way faster than expected',
    name: 'Ethan Black',
  },
  {
    quote:
      "If you want to learn to drive stick cannot recommend Sam / Clutch Academy enough. Came in with ZERO prior experience but we were hitting the roads in no time thanks to Sam's excellent instruction.",
    name: 'Philippe Schwyter',
  },
  {
    quote:
      'Had my first lesson with Sam the other week. Have never driven stick before, but with a short tutorial and plenty of guidance I was able to pick it up pretty quickly.',
    name: 'Jamie Hart',
  },
  {
    quote:
      "Did my first lesson last week with Sam, he was calm and patient around my nerves. Stalled twice on a hill and he didn't flinch. Finally feel like I actually get the clutch. Worth every dollar.",
    name: 'Sol',
  },
]
