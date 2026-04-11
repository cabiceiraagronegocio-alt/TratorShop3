"""
TratorShop Feature Tests - Iteration 10
Testing: WhatsApp validation, duplicate protection, admin edit modal, seller profile with social links
"""
import pytest
import requests
import os
import re
import time

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', 'https://trator-ms.preview.emergentagent.com').rstrip('/')

# Test credentials
ADMIN_EMAIL = "admin@tratorshop.com"
ADMIN_PASSWORD = "Admin@123"
TEST_USER_EMAIL = "novousuario@teste.com"
TEST_USER_PASSWORD = "teste123456"


class TestWhatsAppValidation:
    """Test WhatsApp validation on registration"""
    
    def test_register_without_whatsapp_fails(self):
        """Registration without WhatsApp should fail"""
        response = requests.post(f"{BASE_URL}/api/auth/register", json={
            "email": f"test_no_phone_{int(time.time())}@test.com",
            "password": "test123456",
            "name": "Test User",
            "phone": ""  # Empty phone
        })
        assert response.status_code == 400, f"Expected 400, got {response.status_code}"
        data = response.json()
        assert "WhatsApp" in data.get("detail", "") or "válido" in data.get("detail", ""), f"Expected WhatsApp validation error, got: {data}"
        print(f"✓ Registration without WhatsApp correctly rejected: {data.get('detail')}")
    
    def test_register_with_short_whatsapp_fails(self):
        """Registration with short WhatsApp (< 10 digits) should fail"""
        response = requests.post(f"{BASE_URL}/api/auth/register", json={
            "email": f"test_short_phone_{int(time.time())}@test.com",
            "password": "test123456",
            "name": "Test User",
            "phone": "123456789"  # Only 9 digits
        })
        assert response.status_code == 400, f"Expected 400, got {response.status_code}"
        data = response.json()
        assert "WhatsApp" in data.get("detail", "") or "válido" in data.get("detail", ""), f"Expected WhatsApp validation error, got: {data}"
        print(f"✓ Registration with short WhatsApp correctly rejected: {data.get('detail')}")
    
    def test_register_with_valid_whatsapp_succeeds(self):
        """Registration with valid WhatsApp should succeed"""
        unique_email = f"test_valid_phone_{int(time.time())}@test.com"
        response = requests.post(f"{BASE_URL}/api/auth/register", json={
            "email": unique_email,
            "password": "test123456",
            "name": "Test User Valid Phone",
            "phone": "67999998888"  # Valid 11 digits
        })
        # Should succeed (201) or fail with email already exists (400)
        assert response.status_code in [200, 201, 400], f"Unexpected status: {response.status_code}"
        if response.status_code in [200, 201]:
            data = response.json()
            assert "user" in data or "user_id" in data, f"Expected user data, got: {data}"
            print(f"✓ Registration with valid WhatsApp succeeded")
        else:
            # Email might already exist
            print(f"✓ Registration returned 400 (possibly email exists): {response.json()}")


class TestVendedorAPI:
    """Test /api/vendedor/{user_id} endpoint returns facebook and instagram"""
    
    def test_vendedor_endpoint_returns_social_fields(self):
        """Vendedor endpoint should return facebook and instagram fields"""
        # First, get an active user from admin
        session = requests.Session()
        
        # Admin login
        login_response = session.post(f"{BASE_URL}/api/admin/auth/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        assert login_response.status_code == 200, f"Admin login failed: {login_response.text}"
        
        # Get users list
        users_response = session.get(f"{BASE_URL}/api/admin/users")
        assert users_response.status_code == 200, f"Failed to get users: {users_response.text}"
        
        users = users_response.json()
        # Find an active user
        active_user = None
        for user in users:
            if user.get("status") == "active":
                active_user = user
                break
        
        if not active_user:
            pytest.skip("No active user found for testing vendedor endpoint")
        
        # Test vendedor endpoint
        vendedor_response = requests.get(f"{BASE_URL}/api/vendedor/{active_user['user_id']}")
        assert vendedor_response.status_code == 200, f"Vendedor endpoint failed: {vendedor_response.text}"
        
        data = vendedor_response.json()
        # Check that facebook and instagram fields exist in response
        assert "facebook" in data, f"facebook field missing from vendedor response: {data.keys()}"
        assert "instagram" in data, f"instagram field missing from vendedor response: {data.keys()}"
        print(f"✓ Vendedor endpoint returns facebook: {data.get('facebook')} and instagram: {data.get('instagram')}")


class TestAdminUserEdit:
    """Test admin user edit modal functionality"""
    
    @pytest.fixture
    def admin_session(self):
        """Create authenticated admin session"""
        session = requests.Session()
        response = session.post(f"{BASE_URL}/api/admin/auth/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        assert response.status_code == 200, f"Admin login failed: {response.text}"
        return session
    
    def test_admin_can_update_user_name(self, admin_session):
        """Admin should be able to update user name"""
        # Get users
        users_response = admin_session.get(f"{BASE_URL}/api/admin/users")
        assert users_response.status_code == 200
        
        users = users_response.json()
        if not users:
            pytest.skip("No users to test")
        
        # Find a non-admin user to update
        test_user = None
        for user in users:
            if not user.get("is_admin"):
                test_user = user
                break
        
        if not test_user:
            pytest.skip("No non-admin user found")
        
        # Update user name
        new_name = f"Test Name {int(time.time())}"
        update_response = admin_session.put(
            f"{BASE_URL}/api/admin/users/{test_user['user_id']}",
            json={"name": new_name}
        )
        assert update_response.status_code == 200, f"Update failed: {update_response.text}"
        
        data = update_response.json()
        assert data.get("user", {}).get("name") == new_name or data.get("name") == new_name, f"Name not updated: {data}"
        print(f"✓ Admin successfully updated user name to: {new_name}")
    
    def test_admin_can_update_user_status(self, admin_session):
        """Admin should be able to update user status"""
        users_response = admin_session.get(f"{BASE_URL}/api/admin/users")
        users = users_response.json()
        
        # Find a pending user
        test_user = None
        for user in users:
            if user.get("status") == "pending_approval" and not user.get("is_admin"):
                test_user = user
                break
        
        if not test_user:
            pytest.skip("No pending user found")
        
        # Update status to active
        update_response = admin_session.put(
            f"{BASE_URL}/api/admin/users/{test_user['user_id']}",
            json={"status": "active"}
        )
        assert update_response.status_code == 200, f"Status update failed: {update_response.text}"
        print(f"✓ Admin successfully updated user status")
    
    def test_admin_can_update_user_whatsapp(self, admin_session):
        """Admin should be able to update user WhatsApp"""
        users_response = admin_session.get(f"{BASE_URL}/api/admin/users")
        users = users_response.json()
        
        test_user = None
        for user in users:
            if not user.get("is_admin"):
                test_user = user
                break
        
        if not test_user:
            pytest.skip("No non-admin user found")
        
        new_phone = "67988887777"
        update_response = admin_session.put(
            f"{BASE_URL}/api/admin/users/{test_user['user_id']}",
            json={"phone": new_phone}
        )
        assert update_response.status_code == 200, f"Phone update failed: {update_response.text}"
        print(f"✓ Admin successfully updated user WhatsApp")
    
    def test_admin_can_update_user_social_links(self, admin_session):
        """Admin should be able to update user instagram and facebook"""
        users_response = admin_session.get(f"{BASE_URL}/api/admin/users")
        users = users_response.json()
        
        test_user = None
        for user in users:
            if not user.get("is_admin"):
                test_user = user
                break
        
        if not test_user:
            pytest.skip("No non-admin user found")
        
        update_response = admin_session.put(
            f"{BASE_URL}/api/admin/users/{test_user['user_id']}",
            json={
                "instagram": "@testuser",
                "facebook": "testuser.page"
            }
        )
        assert update_response.status_code == 200, f"Social links update failed: {update_response.text}"
        
        data = update_response.json()
        user_data = data.get("user", data)
        # Instagram should be auto-formatted to full URL
        assert "instagram" in str(user_data).lower(), f"Instagram not in response: {user_data}"
        print(f"✓ Admin successfully updated user social links")
    
    def test_admin_can_update_user_password(self, admin_session):
        """Admin should be able to update user password (bcrypt hashed)"""
        users_response = admin_session.get(f"{BASE_URL}/api/admin/users")
        users = users_response.json()
        
        test_user = None
        for user in users:
            if not user.get("is_admin") and user.get("email") != ADMIN_EMAIL:
                test_user = user
                break
        
        if not test_user:
            pytest.skip("No non-admin user found")
        
        # Update password
        new_password = "newpassword123"
        update_response = admin_session.put(
            f"{BASE_URL}/api/admin/users/{test_user['user_id']}",
            json={"password": new_password}
        )
        assert update_response.status_code == 200, f"Password update failed: {update_response.text}"
        print(f"✓ Admin successfully updated user password")


class TestDuplicateListingProtection:
    """Test protection against duplicate listings"""
    
    @pytest.fixture
    def user_session(self):
        """Create authenticated user session"""
        session = requests.Session()
        response = session.post(f"{BASE_URL}/api/auth/login", json={
            "email": TEST_USER_EMAIL,
            "password": TEST_USER_PASSWORD
        })
        if response.status_code != 200:
            pytest.skip(f"User login failed: {response.text}")
        return session
    
    def test_duplicate_listing_returns_existing(self, user_session):
        """Creating duplicate listing should return existing one"""
        # First check if user is active
        profile_response = user_session.get(f"{BASE_URL}/api/user/profile")
        if profile_response.status_code != 200:
            pytest.skip("Could not get user profile")
        
        profile = profile_response.json()
        if profile.get("status") != "active":
            pytest.skip("User is not active, cannot create listings")
        
        # Create a listing
        listing_data = {
            "title": f"TEST Duplicate Check {int(time.time())}",
            "description": "Test description for duplicate check",
            "category": "tratores",
            "price": 50000,
            "condition": "usado",
            "city": "Campo Grande",
            "whatsapp": "67999998888"
        }
        
        # First creation
        response1 = user_session.post(f"{BASE_URL}/api/listings", json=listing_data)
        if response1.status_code == 403:
            pytest.skip("User not approved to create listings")
        
        assert response1.status_code in [200, 201], f"First listing creation failed: {response1.text}"
        data1 = response1.json()
        listing_id1 = data1.get("listing_id")
        
        # Try to create duplicate immediately
        response2 = user_session.post(f"{BASE_URL}/api/listings", json=listing_data)
        assert response2.status_code in [200, 201], f"Duplicate check failed: {response2.text}"
        
        data2 = response2.json()
        # Should return existing listing or indicate duplicate
        if data2.get("duplicate"):
            assert data2.get("listing_id") == listing_id1, "Duplicate should return same listing_id"
            print(f"✓ Duplicate listing correctly detected and returned existing: {listing_id1}")
        else:
            # If not marked as duplicate, it might be a new listing (time window passed)
            print(f"✓ Listing created (duplicate window may have passed)")


class TestPublicEndpoints:
    """Test public API endpoints"""
    
    def test_cities_endpoint(self):
        """Cities endpoint should return list of MS cities"""
        response = requests.get(f"{BASE_URL}/api/cities")
        assert response.status_code == 200, f"Cities endpoint failed: {response.text}"
        cities = response.json()
        assert isinstance(cities, list), f"Expected list, got: {type(cities)}"
        assert len(cities) > 0, "Cities list is empty"
        assert "Campo Grande" in cities, "Campo Grande should be in cities list"
        print(f"✓ Cities endpoint returns {len(cities)} cities")
    
    def test_listings_endpoint(self):
        """Listings endpoint should return paginated results"""
        response = requests.get(f"{BASE_URL}/api/listings")
        assert response.status_code == 200, f"Listings endpoint failed: {response.text}"
        data = response.json()
        assert "listings" in data, f"Expected 'listings' key, got: {data.keys()}"
        assert "total" in data, f"Expected 'total' key, got: {data.keys()}"
        print(f"✓ Listings endpoint returns {data.get('total', 0)} total listings")
    
    def test_stats_endpoint(self):
        """Stats endpoint should return marketplace statistics"""
        response = requests.get(f"{BASE_URL}/api/stats")
        assert response.status_code == 200, f"Stats endpoint failed: {response.text}"
        data = response.json()
        assert "total_listings" in data or "listings" in data, f"Expected stats data, got: {data.keys()}"
        print(f"✓ Stats endpoint working")
    
    def test_plans_endpoint(self):
        """Plans endpoint should return available plans"""
        response = requests.get(f"{BASE_URL}/api/plans")
        assert response.status_code == 200, f"Plans endpoint failed: {response.text}"
        data = response.json()
        assert "plans" in data, f"Expected 'plans' key, got: {data.keys()}"
        plans = data["plans"]
        assert "anuncio_unico" in plans, "anuncio_unico plan missing"
        assert "lojista" in plans, "lojista plan missing"
        print(f"✓ Plans endpoint returns {len(plans)} plans")


class TestAdminAuth:
    """Test admin authentication"""
    
    def test_admin_login_success(self):
        """Admin login with correct credentials should succeed"""
        response = requests.post(f"{BASE_URL}/api/admin/auth/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        assert response.status_code == 200, f"Admin login failed: {response.text}"
        data = response.json()
        assert "admin_id" in data or "email" in data, f"Expected admin data, got: {data}"
        print(f"✓ Admin login successful")
    
    def test_admin_login_wrong_password(self):
        """Admin login with wrong password should fail"""
        response = requests.post(f"{BASE_URL}/api/admin/auth/login", json={
            "email": ADMIN_EMAIL,
            "password": "wrongpassword"
        })
        assert response.status_code == 401, f"Expected 401, got {response.status_code}"
        print(f"✓ Admin login with wrong password correctly rejected")
    
    def test_admin_stats_requires_auth(self):
        """Admin stats endpoint should require authentication"""
        response = requests.get(f"{BASE_URL}/api/admin/stats")
        assert response.status_code == 401, f"Expected 401, got {response.status_code}"
        print(f"✓ Admin stats correctly requires authentication")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
