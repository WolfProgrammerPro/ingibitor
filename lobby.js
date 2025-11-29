
let time = 3;

const sharedData = localStorage.getItem('sharedData')
let data
if (sharedData)
{
    data = JSON.parse(sharedData)
    ///console.log(data.tests)
    //document.getElementById('before').innerText = "ПРОЙДЕНО ТЕСТОВ ДО ПЕРЕРЫВА: "+data.tests.length+"/3"
    if (data.tests.length < 3)
    {
        console.log("aaa")
        localStorage.setItem('sharedData', JSON.stringify(data))
        document.location = 'test.html'
    }
    else{
        if (!data.timer_was)
        {
            const timerId = setInterval(Tick , 1000)
            function Tick()
            {
                time--;
            //console.log(time)
                let seconds = time % 60
                 let minutes = Math.trunc(time / 60)
                document.getElementById('timer').innerText = minutes + ":" + seconds + " - перерыв перед следующим тестом"
                if (time <= 0)
                {
                    clearInterval(timerId)
                    Next()
                }
            }
            
            function Next()
            {
                data.timer_was = true
                localStorage.setItem('sharedData', JSON.stringify(data))
                document.location = 'test.html'
            }
        }
        else
        {
            if (data.afterTests.length < 3)
            {
                localStorage.setItem('sharedData', JSON.stringify(data))
                document.location = 'test.html'
            }
            else
            {
                document.getElementById('timer').innerText = "АНАЛИЗИРУЕМ РЕЗУЛЬТАТЫ ТЕСТА..."
              analyzeInhibitoryControlResults()
                
            }
        }
    }
}






async function analyzeInhibitoryControlResults() {
    const apiUrl = 'https://api.deepseek.com/v1/chat/completions';
    const apiKey = 'AIzaSyByGtEB0KyMs6ja5UKupjOd8rMCCEywUiM'; // замените на ваш API key
    
    let sum1 = 0;
    let sum2 = 0;
    let sum3 = 0;
    let sum4 = 0;
    
    // Проверяем, что данные существуют
    if (!data || !data.tests || !data.afterTests) {
        console.error('Данные не найдены');
        return;
    }

    // Расчет для тестов в покое
    for (let i = 0; i < data.tests.length; i++) {
        sum1 += data.tests[i].time;
        sum2 += data.tests[i].uncorrect / data.tests[i].answers; // Исправлено: += вместо +
    }
    
    // Расчет для тестов после стимуляции
    for (let i = 0; i < data.afterTests.length; i++) {
        sum3 += data.afterTests[i].time; // Исправлено: sum3 вместо sum1
        sum4 += data.afterTests[i].uncorrect / data.afterTests[i].answers; // Исправлено: += вместо +
    }

    // Расчет средних значений
    const avgTimeRest = data.tests.length > 0 ? sum1 / data.tests.length : 0;
    const avgErrorRest = data.tests.length > 0 ? sum2 / data.tests.length : 0;
    const avgTimeStimulated = data.afterTests.length > 0 ? sum3 / data.afterTests.length : 0;
    const avgErrorStimulated = data.afterTests.length > 0 ? sum4 / data.afterTests.length : 0;

    // Промпт с описанием процедуры и требуемым результатом
    const promptTemplate = `Ты - эксперт психологии и нейробиологии, твоя задача - проанализировать и интерпретировать результаты диагностики ингибиторного контроля. Процедура проведения диагностики следующая:
    Размер таблицы Шульте: 5×5
    Тип таблицы: числовая
    Провести тест в состоянии покоя 3 раза и зафиксировать средний результат.
    Дать испытуемому отдохнуть 5 минут (походить, выпить воды и т.п.).
    Провести тест повторно 3 раза, включая просмотр видеоролика (внешняя стимуляция).
    Зафиксировать средний результат.

    Результаты вашего теста:
    Среднее время нахождения цифр в покое: ${avgTimeRest.toFixed(2)}
    Процент ошибок в покое: ${(avgErrorRest * 100).toFixed(2)}%
    Среднее время нахождения цифр при внешней стимуляции: ${avgTimeStimulated.toFixed(2)}
    Процент ошибок при внешней стимуляции: ${(avgErrorStimulated * 100).toFixed(2)}%

    В ответе выведи, в какой группе находится тестируемый (без нарушений ингибиторного контроля, Нейроразнообразие и нарушения нейроразвития, Приобретенные неврологические состояния,
    Психиатрические расстройства, Последствия старения и нейродегенерации), выведи план развития ингибиторного контроля`;

    try {
        const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': 'Bearer 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',
                'Content-Type': 'application/json',
                'HTTP-Referer': window.location.origin,
                'X-Title': document.title
            },
            body: JSON.stringify({
                model: "tngtech/deepseek-r1t2-chimera:free", // Укажите модель
                messages: [
                    {
                        role: "user",
                        content: promptTemplate
                    }
                ]
            })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        const answer = result.choices[0].message.content.trim()
        document.getElementById('timer').innerText = answer
        const go_no = document.createElement('button')
        go_no.innerText = "Тренажёр GO-NO GO"
        document.body.appendChild(go_no)
        go_no.onclick = function()
        {
            document.location = 'go-nogo.html'
        }
        const stop_sygnal = document.createElement('button')
        stop_sygnal.innerText = "Тренажёр СТОП-СИГНАЛ"
        document.body.appendChild(stop_sygnal)
        stop_sygnal.onclick = function()
        {
            document.location = 'stop-sygnal.html'
        }
        
    } catch (error) {
        console.error('Ошибка при запросе к API:', error);
    }
}


