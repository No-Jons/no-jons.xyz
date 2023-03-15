import uvicorn
import json

from datetime import datetime
from fastapi import FastAPI, Request
from fastapi.responses import RedirectResponse, FileResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates

app = FastAPI(docs_url=None)

app.mount("/static", StaticFiles(directory="static"), name="static")
templates = Jinja2Templates(directory="templates")
VERSION = "1.0.1.0"

LOCATIONS = None
EM_LOCATIONS = None


@app.get("/")
def redirect_to_geordle():
    return RedirectResponse("/geordle")


@app.get("/geordle")
def geordle(request: Request):
    return templates.TemplateResponse("geordle.html", {"request": request, "version": VERSION})


@app.get("/geordle/extreme")
def extreme_mode(request: Request):
    return templates.TemplateResponse("em_geordle.html", {"request": request, "version": VERSION})


@app.get("/geordle/user_data")
def geordle(request: Request):
    return templates.TemplateResponse("view_user_data.html", {"request": request, "version": VERSION})


@app.get("/geordle/stats")
def stats(request: Request):
    return templates.TemplateResponse("stats.html", {"request": request, "version": VERSION})


@app.get("/geordle/past_games")
def past_games(request: Request):
    return templates.TemplateResponse("past_locations.html", {"request": request, "version": VERSION})


@app.get("/geordle/all_games")
def all_games(request: Request):
    return templates.TemplateResponse("all_locations.html", {"request": request, "version": VERSION})


@app.get("/geordle/api/location")
def cur_location(request: Request, date: str, em: bool):
    index = round((datetime.strptime(date, "%Y/%m/%d").timestamp() - datetime.strptime(
        "2023/03/08" if em else "2023/02/12", "%Y/%m/%d").timestamp()) / (24 * 60 * 60))
    return EM_LOCATIONS[index] if em else LOCATIONS[index]


@app.get("/geordle/api/past_locations")
def past_locations(request: Request, date: str):
    index = round((datetime.strptime(date, "%Y/%m/%d").timestamp() - datetime.strptime(
        "2023/02/12", "%Y/%m/%d").timestamp()) / (24 * 60 * 60))
    return LOCATIONS[:index]


@app.get("/geordle/api/all_locations")
def all_locations(request: Request):
    return LOCATIONS


@app.get("/favicon.ico")
def favicon():
    return FileResponse("favicon.ico")


if __name__ == "__main__":
    with open("./data/locations.json", "r") as fp:
        LOCATIONS = json.load(fp)["l"]
    with open("./data/em_locations.json", "r") as fp:
        EM_LOCATIONS = json.load(fp)["l"]
    print(f"Running Geordle v{VERSION}")
    uvicorn.run(app, port=9000)
