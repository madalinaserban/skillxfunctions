const functions = require("firebase-functions");
const admin = require("firebase-admin");
const fetch = require("node-fetch");

admin.initializeApp();
const db = admin.firestore();

exports.updateJobs = functions.pubsub.schedule("0 6 * * *")
  .timeZone("Europe/Bucharest")
  .onRun(async (context) => {
    const response = await fetch("https://remotive.io/api/remote-jobs?search=android");
    const data = await response.json();
    const jobs = data.jobs.slice(0, 20); // Primele 20 joburi

    const batch = db.batch();
    jobs.forEach((job) => {
      const jobRef = db.collection("jobs").doc(job.id.toString());
      batch.set(jobRef, {
        title: job.title,
        company: job.company_name,
        url: job.url,
        location: job.candidate_required_location,
        date: job.publication_date,
        tags: job.tags,
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });
    });

    await batch.commit();
    console.log("Updated job listings in Firestore.");
    return null;
  });
