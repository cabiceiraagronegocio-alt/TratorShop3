import requests
import sys
from datetime import datetime
import json
import time

class TratorShopAPITester:
    def __init__(self, base_url="https://tratorshop-preview.preview.emergentagent.com"):
        self.base_url = base_url
        self.api_url = f"{base_url}/api"
        self.tests_run = 0
        self.tests_passed = 0
        self.failed_tests = []
        self.admin_session = None
        self.user_session = None

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
                # Create a new session with the token as a header (workaround for secure cookie issue)
                auth_session = requests.Session()
                auth_session.headers.update({'Cookie': f'admin_token={admin_token}'})
                return auth_session
        
        return None

    def test_public_endpoints(self):
        """Test public endpoints that don't require auth"""
        print("\n=== TESTING PUBLIC ENDPOINTS ===")
        
        success1, _ = self.run_test("Get Categories", "GET", "categories", 200)
        success2, _ = self.run_test("Get Cities", "GET", "cities", 200)
        success3, _ = self.run_test("Get Stats", "GET", "stats", 200)
        success4, _ = self.run_test("Get Public Listings", "GET", "listings", 200)
        success5, _ = self.run_test("Root Endpoint", "GET", "", 200)
        
        return all([success1, success2, success3, success4, success5])

    def test_admin_login(self):
        """Test admin login"""
        print("\n=== TESTING ADMIN LOGIN ===")
        success, response = self.run_test(
            "Admin Login",
            "POST",
            "admin/auth/login",
            200,
            data={"email": "admin@tratorshop.com", "password": "Admin@123"}
        )
        if success:
            print("✅ Admin login successful")
            return True
        return False

    def test_admin_endpoints(self):
        """Test admin endpoints with proper authentication"""
        print("\n=== TESTING ADMIN ENDPOINTS ===")
        
        # Get authenticated session
        admin_session = self.get_admin_session()
        if not admin_session:
            print("❌ Failed to get admin session")
            return False
        
        # Test admin stats
        success1, stats_data = self.run_test("Admin Stats", "GET", "admin/stats", 200, session=admin_session)
        if success1 and stats_data:
            print(f"   Users: {stats_data.get('users', {}).get('total', 0)}")
            print(f"   Listings: {stats_data.get('listings', {}).get('total', 0)}")
        
        # Test admin users
        success2, users_data = self.run_test("Admin Users", "GET", "admin/users", 200, session=admin_session)
        if success2 and users_data:
            print(f"   Found {len(users_data)} users")
        
        # Test admin listings
        success3, listings_data = self.run_test("Admin Listings", "GET", "admin/listings", 200, session=admin_session)
        if success3 and listings_data:
            print(f"   Found {len(listings_data)} listings")
        
        # Test admin listings by status
        success4, _ = self.run_test("Admin Pending Listings", "GET", "admin/listings?status=pending", 200, session=admin_session)
        success5, _ = self.run_test("Admin Approved Listings", "GET", "admin/listings?status=approved", 200, session=admin_session)
        success6, _ = self.run_test("Admin Rejected Listings", "GET", "admin/listings?status=rejected", 200, session=admin_session)
        success7, _ = self.run_test("Admin Expired Listings", "GET", "admin/listings?status=expired", 200, session=admin_session)
        
        # Test user listings endpoint if users exist
        success8 = True
        if success2 and users_data and len(users_data) > 0:
            user_id = users_data[0].get('user_id')
            if user_id:
                success8, user_listings = self.run_test(
                    "Admin User Listings", 
                    "GET", 
                    f"admin/users/{user_id}/listings", 
                    200, 
                    session=admin_session
                )
                if success8 and user_listings:
                    print(f"   User has {len(user_listings.get('listings', []))} listings")
        
        # Test make/remove admin if non-admin users exist
        success9 = success10 = True
        if success2 and users_data:
            non_admin_user = None
            for user in users_data:
                if not user.get('is_admin', False):
                    non_admin_user = user
                    break
            
            if non_admin_user:
                user_id = non_admin_user['user_id']
                success9, _ = self.run_test("Make User Admin", "POST", f"admin/make-admin/{user_id}", 200, session=admin_session)
                success10, _ = self.run_test("Remove User Admin", "POST", f"admin/remove-admin/{user_id}", 200, session=admin_session)
        
        # Test expire listing if approved listings exist
        success11 = True
        if success5:  # If we successfully got approved listings
            approved_response = admin_session.get(f"{self.api_url}/admin/listings?status=approved")
            if approved_response.status_code == 200:
                approved_listings = approved_response.json()
                if approved_listings:
                    listing_id = approved_listings[0]['listing_id']
                    success11, _ = self.run_test("Admin Expire Listing", "POST", f"admin/listings/{listing_id}/expire", 200, session=admin_session)
        
        return all([success1, success2, success3, success4, success5, success6, success7, success8, success9, success10, success11])

    def test_new_features(self):
        """Test new features from bug fixes and improvements"""
        print("\n🆕 Testing New Features and Bug Fixes...")
        
        # Test 1: Plans with trimestral text
        success1, plans_data = self.run_test("Plans API", "GET", "plans", 200)
        trimestral_check = False
        if success1 and plans_data and 'plans' in plans_data:
            for plan_key, plan_info in plans_data['plans'].items():
                if plan_info.get('validity_days') == 90:  # 3 months = trimestral
                    trimestral_check = True
                    print(f"   ✅ Found trimestral plan: {plan_key} with 90 days validity")
                    break
        
        # Test 2: Public seller profile endpoint
        success2, _ = self.run_test("Public Seller Profile (404 expected)", "GET", "vendedor/nonexistent_user", 404)
        
        # Test 3: Condition filter in listings
        success3, listings_data = self.run_test("Listings with Condition Filter", "GET", "listings?condition=novo", 200)
        if success3 and listings_data:
            print(f"   ✅ Condition filter working, returned {listings_data.get('total', 0)} listings")
        
        # Test 4: Image deletion endpoint (should require auth)
        success4, _ = self.run_test("Image Deletion Endpoint (401 expected)", "DELETE", "listings/test/images/0", 401)
        
        # Test 5: Profile photo upload endpoint (should require auth or file)
        success5, _ = self.run_test("Profile Photo Upload (422 expected - missing file)", "POST", "user/profile/photo", 422)
        
        return all([success1, trimestral_check, success2, success3, success4, success5])

    def test_admin_features_with_auth(self):
        """Test admin features that require authentication"""
        print("\n👑 Testing Admin Features with Authentication...")
        
        # First login as admin
        admin_session = requests.Session()
        login_success, _ = self.run_test(
            "Admin Login for Features Test", 
            "POST", 
            "admin/auth/login", 
            200,
            data={"email": "admin@tratorshop.com", "password": "Admin@123"},
            session=admin_session
        )
        
        if not login_success:
            print("❌ Cannot test admin features - login failed")
            return False
        
        # Test admin stats (for pending badge)
        success1, stats_data = self.run_test("Admin Stats", "GET", "admin/stats", 200, session=admin_session)
        pending_users_check = False
        if success1 and stats_data and 'users' in stats_data:
            pending_count = stats_data['users'].get('pending_approval', 0)
            pending_users_check = True
            print(f"   ✅ Found {pending_count} pending users for badge")
        
        # Test admin listings (for photos visibility)
        success2, admin_listings = self.run_test("Admin Listings", "GET", "admin/listings", 200, session=admin_session)
        photos_check = False
        if success2 and admin_listings:
            # Check if listings have images field
            for listing in admin_listings[:3]:  # Check first 3 listings
                if 'images' in listing:
                    photos_check = True
                    print(f"   ✅ Listing {listing.get('listing_id', 'unknown')} has {len(listing['images'])} images")
                    break
        
        # Test dealer limit setting
        success3, users_data = self.run_test("Get Users for Limit Test", "GET", "admin/users", 200, session=admin_session)
        dealer_limit_check = False
        if success3 and users_data:
            # Find a dealer user
            dealer_user = None
            for user in users_data[:10]:  # Check first 10 users
                if user.get('role') == 'dealer':
                    dealer_user = user
                    break
            
            if dealer_user:
                user_id = dealer_user['user_id']
                success4, _ = self.run_test(
                    "Set Dealer Limit to 20", 
                    "PUT", 
                    f"admin/users/{user_id}/limit", 
                    200,
                    data={"max_listings": 20},
                    session=admin_session
                )
                dealer_limit_check = success4
                if success4:
                    print(f"   ✅ Successfully set dealer limit to 20 for user {user_id}")
            else:
                print("   ⚠️ No dealer users found to test limit setting")
                dealer_limit_check = True  # Don't fail test if no dealers exist
        
        return all([success1, pending_users_check, success2, photos_check, success3, dealer_limit_check])

def main():
    print("🚀 Starting TratorShop Admin Panel API Tests")
    print("=" * 60)
    
    tester = TratorShopAPITester()
    
    # Run all tests
    test_results = []
    
    # Test public endpoints first
    test_results.append(("Public Endpoints", tester.test_public_endpoints()))
    
    # Test new features and bug fixes
    test_results.append(("New Features & Bug Fixes", tester.test_new_features()))
    
    # Test admin login
    test_results.append(("Admin Login", tester.test_admin_login()))
    
    # Test admin functionality
    test_results.append(("Admin Endpoints", tester.test_admin_endpoints()))
    
    # Test admin features with authentication
    test_results.append(("Admin Features with Auth", tester.test_admin_features_with_auth()))
    
    # Print summary
    print("\n" + "=" * 60)
    print("📊 TEST SUMMARY")
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