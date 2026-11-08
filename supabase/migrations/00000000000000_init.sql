-- 1. `ibadah_categories`
CREATE TABLE ibadah_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    icon VARCHAR(255),
    color VARCHAR(50),
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. `ibadah_activities`
CREATE TABLE ibadah_activities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category_id UUID REFERENCES ibadah_categories(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    tracking_type VARCHAR(50) DEFAULT 'boolean',
    is_active BOOLEAN DEFAULT true,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. `ibadah_logs`
CREATE TABLE ibadah_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    activity_id UUID REFERENCES ibadah_activities(id) ON DELETE CASCADE,
    activity_date DATE NOT NULL,
    status VARCHAR(50) NOT NULL,
    prayer_status VARCHAR(50), -- nullable
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE ibadah_logs ADD CONSTRAINT unique_activity_date UNIQUE (activity_id, activity_date);

-- 4. `ibadah_goals`
CREATE TABLE ibadah_goals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    activity_id UUID REFERENCES ibadah_activities(id) ON DELETE CASCADE,
    target_count INTEGER NOT NULL,
    period_type VARCHAR(50) NOT NULL, -- e.g. daily, weekly, monthly
    start_date DATE,
    end_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. `hajats`
CREATE TABLE hajats (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100),
    prayer_text TEXT,
    status VARCHAR(50) DEFAULT 'active',
    target_date DATE,
    granted_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. `hajat_entries`
CREATE TABLE hajat_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    hajat_id UUID REFERENCES hajats(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    content TEXT,
    entry_date DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 7. `journal_entries`
CREATE TABLE journal_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    content TEXT,
    category VARCHAR(100),
    mood VARCHAR(50),
    is_pinned BOOLEAN DEFAULT false,
    entry_date DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 8. `journal_tags`
CREATE TABLE journal_tags (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL UNIQUE
);

-- 9. `journal_entry_tags`
CREATE TABLE journal_entry_tags (
    journal_entry_id UUID REFERENCES journal_entries(id) ON DELETE CASCADE,
    tag_id UUID REFERENCES journal_tags(id) ON DELETE CASCADE,
    PRIMARY KEY (journal_entry_id, tag_id)
);
