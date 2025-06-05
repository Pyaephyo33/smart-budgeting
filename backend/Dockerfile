FROM python:3.10-slim

WORKDIR /app

# Install netcat (for wait-for-it.sh)
RUN apt-get update && apt-get install -y netcat-openbsd

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

# Make wait-for-it script executable
RUN chmod +x wait-for-it.sh

# Run the app only after db is ready
CMD ["./wait-for-it.sh", "db", "--", "python", "app.py"]

