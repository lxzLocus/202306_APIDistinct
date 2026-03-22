const fs = require('fs');
const csv = require('csv-parser');

const filePath = 'D:/Workspace/e_drive/202306/Response/result_12291415.csv';

const evaluationMetrics = {};

fs.createReadStream(filePath)
  .pipe(csv())
  .on('data', (row) => {
    try {
      const endp = row['endp'];
      const recomTar = parseInt(row['recom tar']);
      const matchingFiles = parseInt(row['MatchingFiles']);
      const left = parseInt(row['Left']);
      const errorDetect = parseInt(row['error detect']);
      const totalFiles = parseInt(row['TotalFiles']);

      // ゼロ除算を避けるための条件分岐
      if (recomTar !== 0 && totalFiles !== 0 && matchingFiles !== 0) {
        const TP = matchingFiles;
        const FP = errorDetect;
        const FN = recomTar - matchingFiles;
        const TN = totalFiles - (TP + FP + FN);

        const precision = TP / (TP + FP);
        const recall = TP / (TP + FN);
        const accuracy = (TP + TN) / (TP + FP + FN + TN); // 正解率

        evaluationMetrics[endp] = {
          precision,
          recall,
          accuracy,
          TP,
          FP,
          FN,
          TN,
        };
      }
    } catch (error) {
      console.error('エラーが発生しました:', error.message);
    }
  })
  .on('end', () => {
    const overallMetrics = calculateOverallMetrics(evaluationMetrics);
    console.log('エンドポイントごとの評価指標:', evaluationMetrics);
    console.log('全体の評価指標:', overallMetrics);
  });

function calculateOverallMetrics(metrics) {
  let totalTP = 0;
  let totalFP = 0;
  let totalFN = 0;
  let totalTN = 0;

  for (const endp in metrics) {
    totalTP += metrics[endp].TP;
    totalFP += metrics[endp].FP;
    totalFN += metrics[endp].FN;
    totalTN += metrics[endp].TN;
  }

  // ゼロ除算を避けるための条件分岐
  const overallPrecision = (totalTP !== 0) ? totalTP / (totalTP + totalFP) : 0;
  const overallRecall = (totalTP !== 0) ? totalTP / (totalTP + totalFN) : 0;
  const overallAccuracy = (totalTP + totalTN) / (totalTP + totalFP + totalFN + totalTN); // 全体の正解率

  return {
    precision: overallPrecision,
    recall: overallRecall,
    accuracy: overallAccuracy,
    totalTP,
    totalFP,
    totalFN,
    totalTN,
  };
}
