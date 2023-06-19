# Use the base Python image
FROM python:3.9

# Set the working directory
WORKDIR /app

# Copy the necessary files to the container
COPY requirements.txt .
COPY mostcomplexrepo.py .

# Install the Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Expose the port used by your Flask app
EXPOSE 5000

# Set the command to run your Flask app
CMD ["python", "mostcomplexrepo.py"]
