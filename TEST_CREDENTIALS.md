# 🎓 GUARDIAN TEST CREDENTIALS FOR UI TESTING

✅ **Created 5 Guardian Enrollments with Temporary Credentials**

## 📝 USE THESE CREDENTIALS TO TEST THE GUARDIAN LOGIN FLOW

Login at the regular login page (`/`) - it will automatically detect the temp code prefix and handle the temporary login flow.

---

## 1️⃣ GUARDIAN: Sarah Mensah (GIT - Computer Engineering)

- **Temp Code:** `lumtempcode-a1111111-0001-4001-8001-000000000001`
- **Password:** `TempPass123!`
- **Email:** guardian1@example.com
- **Student:** Michael Boateng
- **Institution:** Ghana Institute of Technology
- **Program:** Year 2 - Computer Engineering

---

## 2️⃣ GUARDIAN: John Asante (GIT - Electrical Engineering)

- **Temp Code:** `lumtempcode-a2222222-0002-4002-8002-000000000002`
- **Password:** `TempPass123!`
- **Email:** guardian2@example.com
- **Student:** Ama Gyasi
- **Institution:** Ghana Institute of Technology
- **Program:** Year 1 - Electrical Engineering

---

## 3️⃣ GUARDIAN: Grace Osei (Ashesi - Business Administration)

- **Temp Code:** `lumtempcode-a3333333-0003-4003-8003-000000000003`
- **Password:** `TempPass123!`
- **Email:** guardian3@example.com
- **Student:** Kwabena Owusu
- **Institution:** Ashesi University
- **Program:** Year 3 - Business Administration

---

## 4️⃣ GUARDIAN: Emmanuel Boateng (Ashesi - Computer Science)

- **Temp Code:** `lumtempcode-a4444444-0004-4004-8004-000000000004`
- **Password:** `TempPass123!`
- **Email:** guardian4@example.com
- **Student:** Efua Ansah
- **Institution:** Ashesi University
- **Program:** Year 2 - Computer Science

---

## 5️⃣ GUARDIAN: Abena Owusu (ATU - Web Development)

- **Temp Code:** `lumtempcode-a5555555-0005-4005-8005-000000000005`
- **Password:** `TempPass123!`
- **Email:** guardian5@example.com
- **Student:** Yaw Appiah
- **Institution:** Accra Technical University
- **Program:** Certificate - Web Development

---

## 🧪 TEST FLOW:

1. **Go to login page** (`/`)
2. **Enter temp code as username** (e.g., `lumtempcode-a1111111-0001-4001-8001-000000000001`)
3. **Enter password:** `TempPass123!`
4. **System detects temp code prefix** (starts with 'lumtempcode-')
5. **You are redirected to `/ecosystem`**
6. **Password change modal appears automatically**
7. **Set new password** (min 8 characters)
8. **Logged out automatically after password change**
9. **Login again with the student's email and new password**

---

## 📊 Database Records Created:

- **Guardians:** 5 guardian records
- **Temp Credentials:** 5 temporary login codes (valid for 5 days)
- **Student Enrollments:** 5 enrollment records (status: PENDING)

---

## 🔐 Security Features:

- ✅ Temp codes expire after 5 days
- ✅ Temp codes are marked as "used" after password change
- ✅ Passwords are hashed with bcrypt (12 rounds)
- ✅ Forced password change on first login
- ✅ Automatic logout after password change

---

## 🎯 Additional Test Accounts:

### Org Admin Accounts (to view enrollments):
- **GIT Admin:** admin@git.edu.gh / password123
- **Ashesi Admin:** admin@ashesi.edu.gh / password123
- **ATU Admin:** admin@atu.edu.gh / password123

Navigate to `/enrollment/list` after logging in as org admin to see the enrollments you created.

---

**✨ Happy Testing! ✨**
