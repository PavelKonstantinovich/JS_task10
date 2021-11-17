function fetchData(url, method, callback) {
  const xhr = new XMLHttpRequest()

  xhr.open(method, url)

  xhr.onload = function () {
    if (xhr.status == 200) {
      callback(xhr.response)
    } else {
      console.error(xhr.statusText + ': ' + xhr.status)
    }
  }

  xhr.onerror = function () {
    console.log(xhr.statusText + ': ' + xhr.status)
  }

  xhr.send()
}

const key = '23a63f7a92d1884dda943845477ecbc1'
const urlWetherCurrent = `https://api.openweathermap.org/data/2.5/weather?q=Minsk,id=524901&lang=ru&appid=${key}`
const urlWetherByDays = `https://api.openweathermap.org/data/2.5/forecast?q=Minsk,id=524901&lang=ru&appid=${key}`

const widgetContainerElement = document.querySelector('#widget')

function widgetHeaderTemplate(weatherData) {
  const { city, date, time, temp, wind, windSpeed, description, iconSrc } = weatherData
  const resultTemp = Math.round(temp) > 0 ? '+' + Math.round(temp) : Math.round(temp)
  

  return `
    <div class="widget-header">
      <div class="d-flex flex-column">
        <div class="mb-auto">
          ${city}<br>${time}<br>${date} 
        </div>

        <div class=" py-5 text-center">
          <img src="${iconSrc}" alt="ico">
          <br>
          <strong class="description">${description}</strong>
          <h2 class="mt-2">${resultTemp}&#8451</h2>
        </div>

        <div class="d-flex">
          <span>${wind} ветер ${windSpeed} м/с</span>
          
        </div>
      </div>
    </div>
  `
}

function renderHeader(data) {
  widgetContainerElement.innerHTML = widgetHeaderTemplate(data)
}


fetchData(urlWetherCurrent, 'GET', (response) => {
  const data = JSON.parse(response)

  const city = data.name
  const windDeg = data.wind.deg
  const windSpeed = Math.round(data.wind.speed)
  const date = new Date(data.dt * 1000).toLocaleString('ru-RU', { day: 'numeric', month: 'long', weekday: 'long'})
  const time = (new Date(data.dt * 1000).getHours() < 10 ? '0' : '') + new Date(data.dt * 1000).getHours() + ':' + (new Date(data.dt * 1000).getMinutes() < 10 ? '0' : '') + new Date(data.dt * 1000).getMinutes()
  const temp = data.main.temp - 273.15
  const description = data.weather[0].description
  const iconSrc = `http://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`

  
  let wind
  switch (true) {
    case windDeg >= 348 && windDeg <= 11:
      wind = 'Северный'
      break
    case windDeg > 11 && windDeg < 78:
      wind = 'Северо-Восточный'
      break
    case windDeg >= 78 && windDeg <= 101:
      wind = 'Восточный'
      break
    case windDeg > 101 && windDeg < 168:
      wind = 'Юго-Восточный'
      break
    case windDeg >= 168 && windDeg <= 191:
      wind = 'Южный'
      break
    case windDeg > 191 && windDeg < 258:
      wind = 'Юго-Западный'
      break
    case windDeg >= 258 && windDeg <= 281:
      wind = 'Западный'
      break
    case windDeg > 281 && windDeg < 348:
      wind = 'Северо-Западный'
      break
  }

  renderHeader({ city, date, time, temp, wind, windSpeed, description, iconSrc })
})

function widgetItemTemplate(weatherData) {
  const { date, iconSrc, temp } = weatherData
  const resultTemp = Math.round(temp) > 0 ? '+' + Math.round(temp) : Math.round(temp)
 
  return `
    <div class="widget-body__item">
      <span>${date}  </span>
      <img src="${iconSrc}" alt="ico">
      <span>${resultTemp}&#8451</span>
    </div>
  `
}

function widgetBodyTemplate(days) {
  const items = days.map((item) => {
    const [date, iconId, temp] = [item.dt_txt, item.weather[0].icon, item.main.temp - 273.15]
    const iconSrc = `http://openweathermap.org/img/wn/${iconId}@2x.png`

    return widgetItemTemplate({ date, iconSrc, temp })
  })

  const itemsHTML = items.join(' ')

  return `
    <div class="widget-body">
      ${itemsHTML}
    </div>
  `
}


function renderBody(data) {
  widgetContainerElement.innerHTML += widgetBodyTemplate(data)
}

fetchData(urlWetherByDays, 'GET', (response) => {
  const data = JSON.parse(response).list

  const resultData = data.filter((item, index) => index % 8 == 0)
  resultData.shift()
    
    renderBody(resultData)
  })

