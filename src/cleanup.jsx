exports.cleanUpExpiredChats = functions.pubsub
  .schedule('every 1 minutes')
  .onRun(async () => {
    const now = new Date();
    const activitiesSnap = await db.collection("activities").get();

    for (const doc of activitiesSnap.docs) {
      const activity = doc.data();
      if (new Date(activity.endTime) < now) {
        // Delete messages
        const messagesSnap = await db.collection("messages").where("roomId", "==", doc.id).get();
        for (const msgDoc of messagesSnap.docs) {
          await db.collection("messages").doc(msgDoc.id).delete();
        }

        // Optionally delete the activity itself
        await db.collection("activities").doc(doc.id).delete();

        console.log(`Cleaned up activity ${doc.id} and its messages`);
      }
    }
  });
