const fs = require('fs');
const csv = require('csv-parser');

const filePath = 'D:/Workspace/e_drive/202306/Response/result_01110530.csv';

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

      if (recomTar !== 0 && totalFiles !== 0 && matchingFiles !== 0) {
        const TP = matchingFiles;
        const FP = errorDetect;
        const FN = recomTar - matchingFiles;
        const TN = totalFiles - (TP + FP + FN);

        if (evaluationMetrics[endp]) {
          evaluationMetrics[endp].TP += TP;
          evaluationMetrics[endp].FP += FP;
          evaluationMetrics[endp].FN += FN;
          evaluationMetrics[endp].TN += TN;
        } else {
          evaluationMetrics[endp] = { TP, FP, FN, TN };
        }
      }
    } catch (error) {
      console.error('エラーが発生しました:', error.message);
    }
  })
  .on('end', () => {
    const endpointMetrics = calculateEndpointMetrics(evaluationMetrics);
    const overallMetrics = calculateOverallMetrics(evaluationMetrics);
    console.log('エンドポイントごとの評価指標:', endpointMetrics);
    console.log('全体の評価指標:', overallMetrics);
  });

function calculateEndpointMetrics(metrics) {
  const endpointMetrics = {};

  for (const endp in metrics) {
    const TP = metrics[endp].TP;
    const FP = metrics[endp].FP;
    const FN = metrics[endp].FN;
    const TN = metrics[endp].TN;

    const precision = TP / (TP + FP);
    const recall = TP / (TP + FN);
    const accuracy = (TP + TN) / (TP + FP + FN + TN);

    endpointMetrics[endp] = { precision, recall, accuracy, TP, FP, FN, TN };
  }

  return endpointMetrics;
}

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

  const overallPrecision = (totalTP !== 0) ? totalTP / (totalTP + totalFP) : 0;
  const overallRecall = (totalTP !== 0) ? totalTP / (totalTP + totalFN) : 0;
  const overallAccuracy = (totalTP + totalTN) / (totalTP + totalFP + totalFN + totalTN);


  // F1スコアの計算
  const overallF1Score = (overallPrecision !== 0 && overallRecall !== 0) ?
  (2 * overallPrecision * overallRecall) / (overallPrecision + overallRecall) : 0;


  return { 
    precision: overallPrecision, 
    recall: overallRecall, 
    accuracy: overallAccuracy, 
    f1Score: overallF1Score,
    totalTP, 
    totalFP, 
    totalFN, 
    totalTN };
}
