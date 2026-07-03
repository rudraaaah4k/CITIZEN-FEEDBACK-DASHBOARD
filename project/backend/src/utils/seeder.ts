import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import User from '../models/User';
import Department from '../models/Department';
import Category from '../models/Category';
import Feedback from '../models/Feedback';
import { analyzeText } from '../services/aiService';
import logger from './logger';

dotenv.config({ path: path.join(__dirname, '../../.env') });

const departments = [
  { name: 'Public Works', code: 'PWD', description: 'Road, bridges, and public infrastructure maintenance', email: 'pwd@cityfeedback.gov', icon: 'Building2', color: '#6366f1' },
  { name: 'Water Supply', code: 'WSD', description: 'Water supply, distribution, and sewage management', email: 'wsd@cityfeedback.gov', icon: 'Droplets', color: '#3b82f6' },
  { name: 'Electricity Board', code: 'ELEC', description: 'Power supply, streetlights, and electrical infrastructure', email: 'elec@cityfeedback.gov', icon: 'Zap', color: '#f59e0b' },
  { name: 'Health Department', code: 'HEALTH', description: 'Public health, hospitals, and medical services', email: 'health@cityfeedback.gov', icon: 'Heart', color: '#ef4444' },
  { name: 'Education Department', code: 'EDU', description: 'Schools, colleges, and educational infrastructure', email: 'edu@cityfeedback.gov', icon: 'GraduationCap', color: '#8b5cf6' },
  { name: 'Sanitation', code: 'SAN', description: 'Garbage collection, cleanliness, and waste management', email: 'san@cityfeedback.gov', icon: 'Trash2', color: '#10b981' },
  { name: 'Police Department', code: 'POLICE', description: 'Law enforcement, public safety, and security', email: 'police@cityfeedback.gov', icon: 'Shield', color: '#1d4ed8' },
  { name: 'Transport Authority', code: 'TRANS', description: 'Public transport, roads, and traffic management', email: 'trans@cityfeedback.gov', icon: 'Bus', color: '#f97316' },
];

const feedbackSamples = [
  { title: 'Major pothole on Main Street causing accidents', description: 'There is a huge pothole on Main Street near the traffic signal that has been causing accidents. Multiple vehicles have damaged their tires. This is extremely dangerous and needs immediate repair. The pothole is about 2 feet wide and very deep. Please fix it urgently.', priority: 'critical', rating: 1, depCode: 'PWD' },
  { title: 'Excellent water supply improvements', description: 'I am really happy to say that the water supply in our area has improved significantly. The water pressure is now good and we get 24/7 water supply. The quality has also improved. Thank you to the water department for the excellent work done.', priority: 'low', rating: 5, depCode: 'WSD' },
  { title: 'Street lights not working for 2 weeks', description: 'The street lights on Park Avenue have not been working for the past 2 weeks. This creates a safety hazard especially for women walking at night. The area has become very dark and I am worried about crime. Please fix the lights as soon as possible.', priority: 'high', rating: 2, depCode: 'ELEC' },
  { title: 'Garbage not collected for 5 days', description: 'The garbage has not been collected from our area for the past 5 days. The entire street is filled with trash and the smell is unbearable. This is a serious health hazard and could lead to disease outbreaks. Please send the garbage truck immediately.', priority: 'high', rating: 1, depCode: 'SAN' },
  { title: 'Hospital staff was very helpful', description: 'I visited the General Hospital last week and was impressed by how helpful and professional the staff was. The doctors were attentive and the nurses were kind. The facilities were also clean. I appreciate the hard work of the health department.', priority: 'low', rating: 5, depCode: 'HEALTH' },
  { title: 'Bus service needs improvement', description: 'The bus service on Route 42 is very poor. Buses come very late and are always overcrowded. Sometimes there are no buses for over an hour. People have to wait in the hot sun. Please increase the frequency of buses and add more routes.', priority: 'medium', rating: 2, depCode: 'TRANS' },
  { title: 'Water contamination in Sector 5', description: 'The water coming from the taps in Sector 5 has a foul smell and appears brown in color. Several residents have reported stomach problems after drinking this water. This is a serious public health emergency. Please test the water quality and take immediate corrective action.', priority: 'critical', rating: 1, depCode: 'WSD' },
  { title: 'School roof leaking', description: 'The roof of Government Primary School in Ward 12 is leaking badly. During rains, water falls directly into the classrooms and students cannot sit comfortably. Several rooms have been damaged. The condition is dangerous for children. Please repair the roof before the next school term.', priority: 'high', rating: 2, depCode: 'EDU' },
  { title: 'Excellent road repair work', description: 'I would like to appreciate the excellent repair work done on the roads in my area. The team worked efficiently and the roads are now in great condition. The work was completed much faster than expected. Well done to the Public Works Department.', priority: 'low', rating: 5, depCode: 'PWD' },
  { title: 'Theft increasing in residential area', description: 'There have been multiple thefts in our residential area over the past month. At least 7 houses have been broken into. The residents are very scared. We request increased police patrolling in the evening and night hours especially on weekends.', priority: 'high', rating: 2, depCode: 'POLICE' },
  { title: 'Traffic congestion at main junction', description: 'The main junction near the market is always heavily congested during morning and evening peak hours. There is no proper traffic management. Accidents are becoming common. Please deploy traffic police and install proper signals.', priority: 'medium', rating: 2, depCode: 'TRANS' },
  { title: 'Park maintenance is wonderful', description: 'The Central Park has been beautifully maintained. The garden is clean, the benches are in good condition, and the walking track is excellent. My family enjoys visiting the park on weekends. Please keep up the great work.', priority: 'low', rating: 5, depCode: 'PWD' },
];

const seed = async (): Promise<void> => {
  try {
    await mongoose.connect(process.env.MONGODB_URI as string);
    logger.info('Connected to MongoDB for seeding');

    await Promise.all([
      User.deleteMany({}),
      Department.deleteMany({}),
      Category.deleteMany({}),
      Feedback.deleteMany({}),
    ]);
    logger.info('Cleared existing data');

    const admin = await User.create({
      name: 'System Administrator',
      email: process.env.ADMIN_EMAIL || 'admin@citizenfeedback.gov',
      password: process.env.ADMIN_PASSWORD || 'Admin@123456',
      role: 'admin',
      isVerified: true,
      isActive: true,
    });
    logger.info(`Admin created: ${admin.email}`);

    const moderator = await User.create({
      name: 'Sarah Johnson',
      email: 'moderator@citizenfeedback.gov',
      password: 'Mod@123456',
      role: 'moderator',
      isVerified: true,
      isActive: true,
    });

    const citizens = await User.insertMany([
      { name: 'Rahul Sharma', email: 'rahul@example.com', password: 'Citizen@123', role: 'citizen', isVerified: true, isActive: true, city: 'Mumbai', state: 'Maharashtra' },
      { name: 'Priya Patel', email: 'priya@example.com', password: 'Citizen@123', role: 'citizen', isVerified: true, isActive: true, city: 'Pune', state: 'Maharashtra' },
      { name: 'Amit Kumar', email: 'amit@example.com', password: 'Citizen@123', role: 'citizen', isVerified: true, isActive: true, city: 'Delhi', state: 'Delhi' },
      { name: 'Sneha Reddy', email: 'sneha@example.com', password: 'Citizen@123', role: 'citizen', isVerified: true, isActive: true, city: 'Hyderabad', state: 'Telangana' },
      { name: 'Vijay Singh', email: 'vijay@example.com', password: 'Citizen@123', role: 'citizen', isVerified: true, isActive: true, city: 'Jaipur', state: 'Rajasthan' },
    ]);
    logger.info(`Created ${citizens.length} citizens`);

    const createdDepts = await Department.insertMany(departments);
    logger.info(`Created ${createdDepts.length} departments`);

    const deptMap: Record<string, mongoose.Types.ObjectId> = {};
    createdDepts.forEach((d) => { deptMap[d.code] = d._id; });

    const categoryData = [
      { name: 'Road Damage', department: deptMap['PWD'], description: 'Potholes, cracks, and road surface issues', icon: 'AlertTriangle', color: '#ef4444' },
      { name: 'Bridge Maintenance', department: deptMap['PWD'], description: 'Bridge structural issues and maintenance', icon: 'Building2', color: '#f59e0b' },
      { name: 'Street Lighting', department: deptMap['ELEC'], description: 'Streetlight outages and electrical issues', icon: 'Lightbulb', color: '#fbbf24' },
      { name: 'Power Outage', department: deptMap['ELEC'], description: 'Electricity supply disruptions', icon: 'Zap', color: '#f97316' },
      { name: 'Water Contamination', department: deptMap['WSD'], description: 'Water quality and safety issues', icon: 'Droplets', color: '#3b82f6' },
      { name: 'Water Shortage', department: deptMap['WSD'], description: 'Inadequate water supply', icon: 'Droplets', color: '#06b6d4' },
      { name: 'Garbage Collection', department: deptMap['SAN'], description: 'Waste pickup scheduling issues', icon: 'Trash2', color: '#10b981' },
      { name: 'Medical Services', department: deptMap['HEALTH'], description: 'Hospital and clinic quality issues', icon: 'Heart', color: '#ef4444' },
      { name: 'School Infrastructure', department: deptMap['EDU'], description: 'School building and facility issues', icon: 'School', color: '#8b5cf6' },
      { name: 'Bus Service', department: deptMap['TRANS'], description: 'Public bus route and frequency issues', icon: 'Bus', color: '#f97316' },
      { name: 'Traffic Management', department: deptMap['TRANS'], description: 'Traffic signals and congestion', icon: 'TrafficCone', color: '#f59e0b' },
      { name: 'Crime & Safety', department: deptMap['POLICE'], description: 'Crime reporting and safety concerns', icon: 'Shield', color: '#1d4ed8' },
    ];

    const createdCats = [];

for (const category of categoryData) {
  createdCats.push(await Category.create(category));
}
    logger.info(`Created ${createdCats.length} categories`);

    const catMap: Record<string, mongoose.Types.ObjectId> = {};
    createdCats.forEach((c) => { catMap[c.name] = c._id; });

    const deptCatMap: Record<string, mongoose.Types.ObjectId> = {
      'PWD': catMap['Road Damage'],
      'WSD': catMap['Water Contamination'],
      'ELEC': catMap['Street Lighting'],
      'SAN': catMap['Garbage Collection'],
      'HEALTH': catMap['Medical Services'],
      'EDU': catMap['School Infrastructure'],
      'TRANS': catMap['Bus Service'],
      'POLICE': catMap['Crime & Safety'],
    };

    const statuses = ['pending', 'under_review', 'in_progress', 'resolved', 'rejected'];
    const locations = [
      { city: 'Mumbai', state: 'Maharashtra', pincode: '400001' },
      { city: 'Delhi', state: 'Delhi', pincode: '110001' },
      { city: 'Bangalore', state: 'Karnataka', pincode: '560001' },
      { city: 'Chennai', state: 'Tamil Nadu', pincode: '600001' },
      { city: 'Hyderabad', state: 'Telangana', pincode: '500001' },
    ];

    for (const sample of feedbackSamples) {
      const aiAnalysis = await analyzeText(sample.title, sample.description);
      const deptId = deptMap[sample.depCode];
      const catId = deptCatMap[sample.depCode];
      const status = statuses[Math.floor(Math.random() * statuses.length)] as 'pending' | 'under_review' | 'in_progress' | 'resolved' | 'rejected';
      const location = locations[Math.floor(Math.random() * locations.length)];
      const randomCitizen = citizens[Math.floor(Math.random() * citizens.length)];
      const isAnonymous = Math.random() > 0.7;

      const createdDaysAgo = Math.floor(Math.random() * 90);
      const createdAt = new Date(Date.now() - createdDaysAgo * 24 * 60 * 60 * 1000);

      await Feedback.create({
        title: sample.title,
        description: sample.description,
        department: deptId,
        category: catId,
        priority: sample.priority,
        rating: sample.rating,
        status,
        location,
        isAnonymous,
        submittedBy: isAnonymous ? undefined : randomCitizen._id,
        aiAnalysis,
        resolvedAt: status === 'resolved' ? new Date(createdAt.getTime() + Math.random() * 7 * 24 * 60 * 60 * 1000) : undefined,
        statusHistory: [{ status: 'pending', changedBy: admin._id, changedAt: createdAt, note: 'Initial submission' }],
        createdAt,
        updatedAt: createdAt,
      });

      await Department.findByIdAndUpdate(deptId, { $inc: { totalFeedback: 1, ...(status === 'resolved' ? { resolvedFeedback: 1 } : {}) } });
    }
    logger.info(`Created ${feedbackSamples.length} feedback entries`);

    logger.info('✅ Seeding completed successfully!');
    logger.info(`Admin: ${process.env.ADMIN_EMAIL} / ${process.env.ADMIN_PASSWORD}`);
    logger.info('Citizens: rahul@example.com / Citizen@123 (and others)');
    
    process.exit(0);
  } catch (error) {
    logger.error(`Seeding failed: ${error}`);
    process.exit(1);
  }
};

seed();
