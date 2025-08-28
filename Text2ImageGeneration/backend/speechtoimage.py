import speech_recognition as sr
import os
from openai import OpenAI
import requests
import webbrowser



# api_key = ""
# monsterapi = Client(api_key)
recognizer = sr.Recognizer()
with sr.Microphone() as source:
    try:
        recognizer.adjust_for_ambient_noise(source, duration=2)
        print("Please Say Something")
        audio = recognizer.listen(source, timeout=5, phrase_time_limit=10)
        text = recognizer.recognize_google(audio, language="en-US")
        print("You:", text)
    except sr.UnknownValueError:
        print("Sorry Could not understand audio")
os.environ["NEBIUS_API_KEY"] = "eyJhbGciOiJIUzI1NiIsImtpZCI6IlV6SXJWd1h0dnprLVRvdzlLZWstc0M1akptWXBvX1VaVkxUZlpnMDRlOFUiLCJ0eXAiOiJKV1QifQ.eyJzdWIiOiJnb29nbGUtb2F1dGgyfDEwNTIyMTI3MzU4Mzg1MjYxMDA4MiIsInNjb3BlIjoib3BlbmlkIG9mZmxpbmVfYWNjZXNzIiwiaXNzIjoiYXBpX2tleV9pc3N1ZXIiLCJhdWQiOlsiaHR0cHM6Ly9uZWJpdXMtaW5mZXJlbmNlLmV1LmF1dGgwLmNvbS9hcGkvdjIvIl0sImV4cCI6MTkxMzk2ODYyOSwidXVpZCI6ImNjNGViNzRjLWIzMjctNDZjNy1hYTc2LTBiOTE0YmI4M2FhOSIsIm5hbWUiOiJpbWFnZWdlbmVyYXRpb25vcGVuYWkiLCJleHBpcmVzX2F0IjoiMjAzMC0wOC0yNlQwOTo1NzowOSswMDAwIn0.z0q_u7GPQI5UNyqWzFsmVN-E3uX7m-g_buqp5Lcej9Y"

client = OpenAI(
    base_url="https://api.studio.nebius.com/v1/",
    api_key=os.environ.get("NEBIUS_API_KEY")
)
response = client.images.generate(
    model="stability-ai/sdxl",
    response_format="url",
    extra_body={
        "response_extension": "png",
        "width": 512,
        "height": 512,
        "num_inference_steps": 30,
        "negative_prompt": "",
        "seed": -1,
        "loras": None
    },
    prompt="Astronaut riding a horse"
)
# while True:
file_name = 3
image = requests.get(response.data[0].url)
with open(f"astronaut{file_name}.png", "wb") as f:
    f.write(image.content)
    # image.save(f"astronaut_horse{file_name}.png")
    file_name += 1



# prompt = ""
# model = "txt2img"
#
# input_data ={
#   "input_variables": {},
#   "prompt": f"{prompt}",
#   "stream": false,
#   "n": 1,
#   "temperature": 0.7,
#   "max_tokens": 256
# }
#
# result = monsterapi.generate(model, input_data)
# print(result["output"][0])
# img_url = result["output"][0]
# file_name = "generated_img.jpg"
# response = requests.get(img_url)
# if response.status_code == 200:
#     with open(file_name,"wb") as f:
#         f.write(response.content)
#     webbrowser.open(file_name)
# else:
#     print("File did'nt get downloaded")
