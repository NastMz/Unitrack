FROM python:3.10.9-alpine3.17

RUN apk update \
    && apk add --no-cache gcc musl-dev postgresql-dev python3-dev libffi-dev \
    && pip install --upgrade pip

# Set an environment variable with the directory
# where we'll be running the app
ENV APP /app

# Create the directory and instruct Docker to operate
# from there from now on
RUN mkdir $APP

WORKDIR $APP

# Expose the port uWSGI will listen on
#EXPOSE 8000

# Copy the requirements file in order to install
# Python dependencies
COPY requirements.txt .

# Install Python dependencies
RUN pip install -r requirements.txt

# We copy the rest of the codebase into the image
COPY . .

# Finally, we run uWSGI with the ini file we
# created earlier
CMD [ "uwsgi", "app.ini" ]
# CMD [ "python", "app.py"]