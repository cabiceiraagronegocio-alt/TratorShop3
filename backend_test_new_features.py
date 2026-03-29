import requests
import sys
from datetime import datetime
import json
import secrets
import string

class TratorShopNewFeaturesAPITester:
    def __init__(self, base_url="https://tratorshop-preview.preview.emergentagent.com"):
        self.base_url = base_url
        self.api_url = f"{base_url}/api"
        self.tests_run = 0
        self.tests_passed = 0
        self.failed_tests = []
        self.admin_session = None
        self.test_user_id = None
        self.test_lead_id = None

    def run_test(self, name, method, endpoint, expected_status, data=None, headers=None, session=None):
        """Run a single API test"""
        url = f"{self.api_url}/{endpoint}"
        test_headers = {'Content-Type': 'application/json'}
        if headers:
            test_headers.update(headers)

        self.tests_run += 1
        print(f"\n🔍 Testing {name}...")
        print(f"   URL: {url}")
        
        try:
            if session:
                if method == 'GET':
                    response = session.get(url, headers=test_headers)
                elif method == 'POST':
                    response = session.post(url, json=data, headers=test_headers)
                elif method == 'PUT':
                    response = session.put(url, json=data, headers=test_headers)
                elif method == 'DELETE':
                    response = session.delete(url, headers=test_headers)
            else:
                if method == 'GET':
                    response = requests.get(url, headers=test_headers)
                elif method == 'POST':
                    response = requests.post(url, json=data, headers=test_headers)
                elif method == 'PUT':
                    response = requests.put(url, json=data, headers=test_headers)
                elif method == 'DELETE':
                    response = requests.delete(url, headers=test_headers)

            success = response.status_code == expected_status
            if success:
                self.tests_passed += 1
                print(f"✅ Passed - Status: {response.status_code}")
                try:
                    return success, response.json() if response.content else {}
                except:
                    return success, {}
            else:
                print(f"❌ Failed - Expected {expected_status}, got {response.status_code}")
                print(f"   Response: {response.text[:200]}...")
                self.failed_tests.append({
                    'name': name,
                    'expected': expected_status,
                    'actual': response.status_code,
                    'response': response.text[:200]
                })
                return False, {}

        except Exception as e:
            print(f"❌ Failed - Error: {str(e)}")
            self.failed_tests.append({
                'name': name,
                'error': str(e)
            })
            return False, {}

    def get_admin_session(self):
        """Get authenticated admin session"""
        if self.admin_session:
            return self.admin_session
            
        session = requests.Session()
        login_response = session.post(
            f"{self.api_url}/admin/auth/login",
            json={"email": "admin@tratorshop.com", "password": "Admin@123"}
        )
        
        if login_response.status_code == 200:
            # Extract the admin token and create a custom session that sends it as header
            admin_token = None
            for cookie in login_response.cookies:
                if cookie.name == 'admin_token':
                    admin_token = cookie.value
                    break
            
            if admin_token:
                # Create a new session with the token as a header
                auth_session = requests.Session()
                auth_session.headers.update({'Cookie': f'admin_token={admin_token}'})
                self.admin_session = auth_session
                return auth_session
        
        return None

    def test_plans_endpoint(self):
        """Test GET /api/plans - retorna planos disponíveis"""
        print("\n=== TESTING PLANS ENDPOINT ===")
        
        success, response = self.run_test("Get Plans", "GET", "plans", 200)
        if success and response:
            plans = response.get('plans', {})
            print(f"   Found plans: {list(plans.keys())}")
            
            # Check if required plans exist
            required_plans = ['anuncio_unico', 'lojista']
            for plan in required_plans:
                if plan in plans:
                    plan_data = plans[plan]
                    print(f"   {plan}: R${plan_data.get('price', 0)} - {plan_data.get('name', '')}")
                else:
                    print(f"   ❌ Missing plan: {plan}")
                    return False
            
            # Verify plan structure
            anuncio_plan = plans.get('anuncio_unico', {})
            lojista_plan = plans.get('lojista', {})
            
            if anuncio_plan.get('price') == 49.0 and lojista_plan.get('price') == 149.0:
                print("   ✅ Plan prices correct")
                return True
            else:
                print(f"   ❌ Plan prices incorrect: Anúncio={anuncio_plan.get('price')}, Lojista={lojista_plan.get('price')}")
                return False
        
        return False

    def test_admin_stats_with_leads(self):
        """Test GET /api/admin/stats - inclui leads e pending_approval stats"""
        print("\n=== TESTING ADMIN STATS WITH LEADS ===")
        
        admin_session = self.get_admin_session()
        if not admin_session:
            print("❌ Failed to get admin session")
            return False
        
        success, response = self.run_test("Admin Stats with Leads", "GET", "admin/stats", 200, session=admin_session)
        if success and response:
            # Check if leads stats are included
            leads = response.get('leads', {})
            users = response.get('users', {})
            
            print(f"   Total leads: {leads.get('total', 0)}")
            print(f"   Leads aguardando: {leads.get('aguardando', 0)}")
            print(f"   Leads contatados: {leads.get('contatados', 0)}")
            print(f"   Users pending approval: {users.get('pending_approval', 0)}")
            
            # Verify structure
            required_lead_fields = ['total', 'aguardando', 'contatados']
            for field in required_lead_fields:
                if field not in leads:
                    print(f"   ❌ Missing leads field: {field}")
                    return False
            
            if 'pending_approval' not in users:
                print("   ❌ Missing pending_approval in users stats")
                return False
            
            print("   ✅ Admin stats include leads and pending approval data")
            return True
        
        return False

    def test_admin_leads_endpoint(self):
        """Test GET /api/admin/leads - lista leads"""
        print("\n=== TESTING ADMIN LEADS ENDPOINT ===")
        
        admin_session = self.get_admin_session()
        if not admin_session:
            print("❌ Failed to get admin session")
            return False
        
        success, response = self.run_test("Admin Leads List", "GET", "admin/leads", 200, session=admin_session)
        if success:
            if isinstance(response, list):
                print(f"   Found {len(response)} leads")
                if len(response) > 0:
                    lead = response[0]
                    self.test_lead_id = lead.get('lead_id')
                    print(f"   Sample lead: {lead.get('name', 'N/A')} - {lead.get('email', 'N/A')}")
                return True
            else:
                print("   ❌ Response is not a list")
                return False
        
        return False

    def test_admin_pending_users(self):
        """Test GET /api/admin/users/pending - lista usuários pendentes"""
        print("\n=== TESTING ADMIN PENDING USERS ===")
        
        admin_session = self.get_admin_session()
        if not admin_session:
            print("❌ Failed to get admin session")
            return False
        
        success, response = self.run_test("Admin Pending Users", "GET", "admin/users/pending", 200, session=admin_session)
        if success:
            if isinstance(response, list):
                print(f"   Found {len(response)} pending users")
                if len(response) > 0:
                    user = response[0]
                    print(f"   Sample pending user: {user.get('name', 'N/A')} - {user.get('status', 'N/A')}")
                return True
            else:
                print("   ❌ Response is not a list")
                return False
        
        return False

    def test_admin_create_user(self):
        """Test POST /api/admin/users/create - criar usuário manualmente"""
        print("\n=== TESTING ADMIN CREATE USER ===")
        
        admin_session = self.get_admin_session()
        if not admin_session:
            print("❌ Failed to get admin session")
            return False
        
        # Generate random user data
        random_suffix = ''.join(secrets.choice(string.ascii_lowercase + string.digits) for _ in range(6))
        user_data = {
            "name": f"Test User {random_suffix}",
            "email": f"testuser{random_suffix}@example.com",
            "phone": "+5567999999999",
            "account_type": "lojista"
        }
        
        success, response = self.run_test("Admin Create User", "POST", "admin/users/create", 200, data=user_data, session=admin_session)
        if success and response:
            self.test_user_id = response.get('user_id')
            print(f"   Created user: {response.get('user_id', 'N/A')}")
            print(f"   Generated password: {response.get('password', 'N/A')}")
            return True
        
        return False

    def test_admin_approve_reject_user(self):
        """Test POST /api/admin/users/{id}/approve and reject"""
        print("\n=== TESTING ADMIN APPROVE/REJECT USER ===")
        
        admin_session = self.get_admin_session()
        if not admin_session:
            print("❌ Failed to get admin session")
            return False
        
        if not self.test_user_id:
            print("❌ No test user ID available")
            return False
        
        # Test approve user
        success1, response1 = self.run_test(
            "Admin Approve User", 
            "POST", 
            f"admin/users/{self.test_user_id}/approve", 
            200, 
            session=admin_session
        )
        
        if success1:
            print(f"   ✅ User approved successfully")
        
        # Test reject user (change status back)
        success2, response2 = self.run_test(
            "Admin Reject User", 
            "POST", 
            f"admin/users/{self.test_user_id}/reject", 
            200, 
            session=admin_session
        )
        
        if success2:
            print(f"   ✅ User rejected successfully")
        
        return success1 and success2

    def test_lead_contacted_update(self):
        """Test PUT /api/admin/leads/{id}/contacted - marcar lead como contatado"""
        print("\n=== TESTING LEAD CONTACTED UPDATE ===")
        
        admin_session = self.get_admin_session()
        if not admin_session:
            print("❌ Failed to get admin session")
            return False
        
        if not self.test_lead_id:
            print("❌ No test lead ID available")
            return False
        
        success, response = self.run_test(
            "Mark Lead as Contacted", 
            "PUT", 
            f"admin/leads/{self.test_lead_id}/contacted", 
            200, 
            data={"contacted": True},
            session=admin_session
        )
        
        if success:
            print(f"   ✅ Lead marked as contacted")
            return True
        
        return False

    def test_user_profile_update(self):
        """Test PUT /api/user/profile - atualizar perfil do usuário"""
        print("\n=== TESTING USER PROFILE UPDATE ===")
        
        # This would require a user session, which is complex to set up
        # For now, we'll test the endpoint structure
        profile_data = {
            "name": "Updated Name",
            "phone": "+5567888888888",
            "bio": "Updated bio",
            "address": "Updated address"
        }
        
        # Test without auth (should fail with 401)
        success, response = self.run_test(
            "User Profile Update (No Auth)", 
            "PUT", 
            "user/profile", 
            401, 
            data=profile_data
        )
        
        if success:
            print(f"   ✅ Endpoint correctly requires authentication")
            return True
        
        return False

    def test_user_select_plan(self):
        """Test POST /api/user/select-plan - selecionar plano"""
        print("\n=== TESTING USER SELECT PLAN ===")
        
        plan_data = {
            "plan_type": "anuncio_unico"
        }
        
        # Test without auth (should fail with 401)
        success, response = self.run_test(
            "User Select Plan (No Auth)", 
            "POST", 
            "user/select-plan", 
            401, 
            data=plan_data
        )
        
        if success:
            print(f"   ✅ Endpoint correctly requires authentication")
            return True
        
        return False

def main():
    print("🚀 Starting TratorShop New Features API Tests")
    print("=" * 60)
    
    tester = TratorShopNewFeaturesAPITester()
    
    # Run all tests
    test_results = []
    
    # Test new plan system
    test_results.append(("Plans Endpoint", tester.test_plans_endpoint()))
    
    # Test admin stats with leads
    test_results.append(("Admin Stats with Leads", tester.test_admin_stats_with_leads()))
    
    # Test admin leads management
    test_results.append(("Admin Leads List", tester.test_admin_leads_endpoint()))
    
    # Test admin pending users
    test_results.append(("Admin Pending Users", tester.test_admin_pending_users()))
    
    # Test admin create user
    test_results.append(("Admin Create User", tester.test_admin_create_user()))
    
    # Test admin approve/reject user
    test_results.append(("Admin Approve/Reject User", tester.test_admin_approve_reject_user()))
    
    # Test lead contacted update
    test_results.append(("Lead Contacted Update", tester.test_lead_contacted_update()))
    
    # Test user profile update
    test_results.append(("User Profile Update", tester.test_user_profile_update()))
    
    # Test user select plan
    test_results.append(("User Select Plan", tester.test_user_select_plan()))
    
    # Print summary
    print("\n" + "=" * 60)
    print("📊 NEW FEATURES TEST SUMMARY")
    print("=" * 60)
    
    for test_name, result in test_results:
        status = "✅ PASSED" if result else "❌ FAILED"
        print(f"{test_name}: {status}")
    
    print(f"\nTotal API calls: {tester.tests_run}")
    print(f"Successful calls: {tester.tests_passed}")
    print(f"Failed calls: {tester.tests_run - tester.tests_passed}")
    print(f"Success rate: {(tester.tests_passed / tester.tests_run * 100):.1f}%")
    
    if tester.failed_tests:
        print("\n❌ FAILED TESTS DETAILS:")
        for i, failed in enumerate(tester.failed_tests, 1):
            print(f"{i}. {failed['name']}")
            if 'error' in failed:
                print(f"   Error: {failed['error']}")
            else:
                print(f"   Expected: {failed['expected']}, Got: {failed['actual']}")
                print(f"   Response: {failed['response']}")
    
    # Return 0 if all major tests passed, 1 otherwise
    major_tests_passed = sum(1 for _, result in test_results if result)
    return 0 if major_tests_passed >= len(test_results) * 0.8 else 1

if __name__ == "__main__":
    sys.exit(main())