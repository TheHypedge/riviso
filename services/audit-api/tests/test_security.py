"""
Security tests for audit functionality.
"""

import pytest
from audit.security import SecurityValidator


@pytest.fixture
def security_validator():
    """Create security validator instance."""
    return SecurityValidator()


@pytest.mark.asyncio
async def test_validate_safe_urls(security_validator):
    """Test validation of safe URLs."""
    safe_urls = [
        "https://example.com",
        "https://www.google.com",
        "http://httpbin.org",
        "https://github.com",
    ]
    
    for url in safe_urls:
        # Should not raise an exception
        await security_validator.validate_url(url)


@pytest.mark.asyncio
async def test_validate_dangerous_protocols(security_validator):
    """Test validation of dangerous protocols."""
    dangerous_urls = [
        "file:///etc/passwd",
        "ftp://example.com",
        "javascript:alert('xss')",
        "data:text/html,<script>alert('xss')</script>",
        "gopher://example.com",
        "ldap://example.com",
        "mailto:test@example.com",
        "telnet://example.com",
        "ssh://example.com",
        "sftp://example.com",
        "tftp://example.com",
        "jar:file://example.com",
        "nntp://example.com",
    ]
    
    for url in dangerous_urls:
        with pytest.raises(ValueError, match="Protocol not allowed|Dangerous protocol"):
            await security_validator.validate_url(url)


@pytest.mark.asyncio
async def test_validate_private_ips(security_validator):
    """Test validation of private IP addresses."""
    private_urls = [
        "http://127.0.0.1",
        "http://localhost",
        "http://192.168.1.1",
        "http://10.0.0.1",
        "http://172.16.0.1",
        "http://169.254.1.1",
    ]
    
    for url in private_urls:
        with pytest.raises(ValueError, match="SSRF pattern detected|private IP|reserved IP"):
            await security_validator.validate_url(url)


@pytest.mark.asyncio
async def test_validate_suspicious_patterns(security_validator):
    """Test validation of suspicious URL patterns."""
    suspicious_urls = [
        "https://example.com@malicious.com",
        "https://example.com#@malicious.com",
        "https://example.com#javascript:alert('xss')",
    ]
    
    for url in suspicious_urls:
        with pytest.raises(ValueError, match="Suspicious pattern detected"):
            await security_validator.validate_url(url)


def test_validate_content_type(security_validator):
    """Test content type validation."""
    safe_types = [
        "text/html",
        "text/plain",
        "application/xhtml+xml",
        "application/xml",
        "text/xml",
    ]
    
    for content_type in safe_types:
        assert security_validator.validate_content_type(content_type)
    
    dangerous_types = [
        "application/x-executable",
        "application/x-msdownload",
        "application/x-javascript",
        "text/javascript",
        "application/javascript",
        "text/vbscript",
        "application/x-vbscript",
    ]
    
    for content_type in dangerous_types:
        assert not security_validator.validate_content_type(content_type)


def test_validate_content_size(security_validator):
    """Test content size validation."""
    assert security_validator.validate_content_size(1024)  # 1KB
    assert security_validator.validate_content_size(1048576)  # 1MB
    assert security_validator.validate_content_size(10485760)  # 10MB
    
    assert not security_validator.validate_content_size(10485761)  # > 10MB
    assert not security_validator.validate_content_size(104857600)  # 100MB
