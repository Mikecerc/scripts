import requests, sys, pygame
from bs4 import BeautifulSoup

def getPageData(url): 
    data = requests.get(url)
    return data
def getInfo():
    data = getPageData("https://www.wunderground.com/dashboard/pws/KMICANTO99")
    soup = BeautifulSoup(data.content, 'html.parser')
    temp = soup.find(class_='main-temp').get_text().replace("\xa0°F", "")
    feels = soup.find(class_='feels-like-temp weather__header').get_text().replace(" Feels Like ", "").replace("\xa0°", "")
    windDir = soup.find(class_='wind-dial__container').get_text()
    wind = soup.find(class_='weather__text').get_text().split("/")[0].replace("\xa0° ", "")
    gust = soup.find(class_='weather__text').get_text().split("/")[1].replace("\xa0°mph", "")
    #print (soup.find(class_='weather__summary').get_text().replace("DEWPOINT", "").replace("\xa0°", "").replace("PRECIP RATE",""))
    summary = soup.find(class_='weather__summary').get_text().replace("°", "").replace("DEWPOINT", "").replace("FPRECIP RATE", "").replace("in/hrPRESSURE", "").replace("inHUMIDITY", "").replace("%PRECIP ACCUM", "").replace("inUV", "").split("\xa0")
    dew = summary[0]
    precip = summary[1]
    pressure = summary[2]
    humidity = summary[3]
    precipAcc = summary[4]
    uv = summary[5]
    return [temp, feels, windDir, wind, gust, dew, precip, pressure, humidity, precipAcc, uv] 
    #print(soup.find(class_='main-temp').get_text())
    #print('-', soup.find(class_='feels-like-temp weather__header').get_text())
    #print('-', soup.find(class_='wind-dial__container').get_text())
    #print('-', soup.find(class_='weather__text').get_text())
    #sum = ''
    #for val in soup.find(class_='weather__summary'):
    #    print(val.get_text())
   # sum = sum + '-' + val.get_text()
#print(newVal.encode('ascii', errors='ignore').decode('UTF-8'))
data = getInfo()
pygame.init()
size = width, height = 400, 300
screen = pygame.display.set_mode(size)
font = pygame.font.SysFont("monospace", 15)
header = pygame.font.SysFont("monospace", 20)
screen.fill((255, 255, 255))
#make the a pygame message text that is font size 20 and bolded   
msg = header.render("Local Weather Data:", 1, (0,0,0))
temp = font.render("Temp: " + data[0] + "°F", 1, (0,0,0))
feels = font.render("Feels Like: " + data[1] + "°F" , 1, (0,0,0))
windDir = font.render("Wind Direction: " + data[2], 1, (0,0,0))
wind = font.render("Wind: " + data[3] + "mph", 1, (0,0,0))
gust = font.render("Gust: " + data[4] + "mph", 1, (0,0,0))
dew = font.render("Dew Point: " + data[5] + "°F", 1, (0,0,0))
precip = font.render("Precipitation: " + data[6] + "in/hr", 1, (0,0,0))
pressure = font.render("Pressure: " + data[7] + "in", 1, (0,0,0))
humidity = font.render("Humidity: " + data[8] + "%", 1, (0,0,0))
precipAcc = font.render("Precipitation Accumulation: " + data[9] + "in", 1, (0,0,0))
uv = font.render("UV: " + data[10], 1, (0,0,0))
screen.blit(msg, (10, 10))
screen.blit(temp, (10, 30))
screen.blit(feels, (10, 50))
screen.blit(windDir, (10, 70))
screen.blit(wind, (10, 90))
screen.blit(gust, (10, 110))
screen.blit(dew, (10, 130))
screen.blit(precip, (10, 150))
screen.blit(pressure, (10, 170))
screen.blit(humidity, (10, 190))
screen.blit(precipAcc, (10, 210))
screen.blit(uv, (10, 230))

while True: 
    for event in pygame.event.get():
        if event.type == pygame.QUIT: sys.exit()
    pygame.display.flip()