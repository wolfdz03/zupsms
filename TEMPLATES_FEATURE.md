# Template Message Management Feature

## Overview
Added complete template message management system to ZUPsms, allowing coordinators to create, edit, delete, and use custom SMS message templates.

## ✅ Features Implemented

### 1. Database Schema
- **New Table**: `message_templates`
  - `id` (uuid, primary key)
  - `name` (text, required) - Template name
  - `content` (text, required) - Message content with variables
  - `isDefault` (boolean) - Mark template as default
  - `createdAt` (timestamp)
  - `updatedAt` (timestamp)

### 2. API Routes
**`/api/templates` - Template List & Create**
- `GET` - Fetch all templates (ordered by isDefault, then createdAt)
- `POST` - Create new template
  - Validates name and content
  - Automatically unsets other defaults if new template is default
  
**`/api/templates/[id]` - Individual Template Operations**
- `GET` - Fetch single template
- `PATCH` - Update template
  - Handles default template switching
- `DELETE` - Delete template

### 3. SMS Settings Page Updates
**New "Modèles" Tab**
- Located between "Paramètres" and "Tester" tabs
- Full CRUD interface for templates
- Features:
  - **Empty State**: Clean empty state with call-to-action button
  - **Template Grid**: 2-column responsive grid
  - **Template Cards** showing:
    - Name with star badge for default templates
    - Character count and SMS count badges
    - Message preview
    - Action buttons (Use, Edit, Delete)
  - **Orange accent colors** following ZUPCO design system

**Create/Edit Dialog**
- Large modal with:
  - Template name input
  - Message content textarea
  - Variables helper (showing available placeholders)
  - Real-time character count
  - SMS count calculation
  - "Set as default" checkbox
  - Validation (prevents saving if content > 306 chars)

**Delete Confirmation Dialog**
- Confirms deletion with template name
- Prevents accidental deletions

### 4. Template Features

**Variables Support**
Templates support dynamic variables:
- `{student_name}` - Student's full name
- `{start_time}` - Session start time
- `{day}` - Day of the week

**Default Template**
- Only one template can be default at a time
- Default templates are highlighted with:
  - Orange border and background
  - Star badge
  - "Par défaut" label

**Character Validation**
- Real-time character counting
- Color-coded badges:
  - Green: ≤ 160 characters (1 SMS)
  - Blue: 161-306 characters (2 SMS)
  - Red: > 306 characters (invalid)
- Prevents saving over-limit templates

**Quick Actions**
- **Use**: Instantly applies template to current message
- **Edit**: Opens dialog with template data pre-filled
- **Delete**: Removes template after confirmation

### 5. UX Enhancements

**ZUPCO Design Applied**
- Orange accent buttons (`bg-orange-500`)
- Rounded corners (`rounded-xl`, `rounded-2xl`)
- Generous spacing (p-8, gap-6)
- Shadow effects (`shadow-card`, `shadow-card-hover`)
- Hover transitions
- Clean typography hierarchy

**Smart Defaults**
- First tab loads with settings
- Templates sorted by default status first
- Empty state encourages first template creation

**User Feedback**
- Toast notifications for all actions
- Loading states during operations
- Disabled states when appropriate
- Clear error messages

## 🎯 Use Cases

### For Coordinators
1. **Create Library**: Build a collection of message templates for different scenarios
2. **Quick Selection**: Apply templates with one click
3. **Consistency**: Ensure all messages follow same format
4. **Time Saving**: No need to rewrite messages repeatedly
5. **Team Alignment**: Share standard templates across coordinators

### Example Templates
- **Morning Reminder**: "Bonjour {student_name}, votre cours commence à {start_time}. À bientôt!"
- **Urgent Reminder**: "⚠️ {student_name}, votre cours commence dans 5 minutes!"
- **Friendly Tone**: "Salut {student_name}! RDV dans 15 min pour ton cours 😊"
- **Professional**: "Bonjour {student_name}, rappel pour votre session du {day} à {start_time}."

## 📊 Technical Details

### Database Migration
- Migration file: `0002_optimal_hellion.sql`
- Applied successfully
- Table created with all constraints

### API Endpoints
```
GET    /api/templates          - List all templates
POST   /api/templates          - Create template
GET    /api/templates/[id]     - Get single template
PATCH  /api/templates/[id]     - Update template
DELETE /api/templates/[id]     - Delete template
```

### State Management
- React useState for all template operations
- Optimistic UI updates
- Proper loading states
- Error handling

### Validation Rules
1. Name and content required
2. Content must be ≤ 306 characters
3. Only one template can be default
4. Cannot delete while saving

## 🎨 Design System Consistency

**Colors**
- Primary: Orange (`#FF7A3D`)
- Success: Green (character counts)
- Error: Red (over limit)
- Info: Blue (SMS counts)

**Components**
- Cards with `border-2` and `shadow-card`
- Rounded corners throughout
- Consistent button heights (`h-10`, `h-12`)
- Badge variants for status

**Spacing**
- 16-24px breathing room from borders
- Consistent gap sizes (gap-2, gap-3, gap-6)
- Generous padding in cards

**Typography**
- Clear hierarchy (text-3xl, text-2xl, text-lg, text-base)
- Consistent font weights
- Proper line heights

## 🚀 Next Steps (Optional Enhancements)

1. **Categories**: Group templates by category (Morning, Evening, Urgent, etc.)
2. **Sharing**: Export/import templates between coordinators
3. **Analytics**: Track which templates are most used
4. **Scheduling**: Attach templates to specific time slots
5. **Variables**: Add more dynamic variables (tutor name, subject, etc.)
6. **Search**: Filter templates by name or content
7. **Favorites**: Quick access to frequently used templates
8. **Preview**: Show real preview with actual student data

## 📁 Files Created
- `zupsms/app/api/templates/route.ts` - List & create endpoints
- `zupsms/app/api/templates/[id]/route.ts` - Individual template endpoints
- `zupsms/db/migrations/0002_optimal_hellion.sql` - Database migration
- `zupsms/TEMPLATES_FEATURE.md` - This documentation

## 📝 Files Modified
- `zupsms/db/schema.ts` - Added messageTemplates table
- `zupsms/app/sms-settings/page.tsx` - Added templates tab and functionality

## ✨ Result

The template message management system is fully functional and ready for use! Coordinators can now:
- ✅ Create unlimited custom templates
- ✅ Mark templates as default
- ✅ Use templates with one click
- ✅ Edit and delete templates
- ✅ See real-time character counts
- ✅ Validate message lengths
- ✅ Use dynamic variables

All features follow the ZUPCO design system and provide a smooth, intuitive user experience. 🎉

